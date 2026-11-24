import type { Answer, GradedStep, Step } from './types';

/**
 * Brouillon de l'étape courante (choix, cases cochées, mots placés…), remis à
 * zéro à chaque étape. TypeScript pur : les composants ne font qu'appeler ces
 * fonctions, la logique d'interaction est testée ici.
 */
export type Draft = {
  /** mcq : clé choisie. */
  choice?: string;
  /** predict_reveal : solution révélée. */
  revealed?: boolean;
  /** checklist : index des cases cochées. */
  checked?: number[];
  /** multi : clés cochées. */
  keys?: string[];
  /** true_false : valeur choisie. */
  value?: boolean;
  /** fill_blank : pour chaque trou, l'index du mot de la banque placé (ou null). */
  slots?: (number | null)[];
  /** order : éléments dans l'ordre choisi. */
  order?: string[];
  /** match : index gauche → index droite (dans `step.pairs`). */
  links?: Record<number, number>;
  /** match : terme sélectionné en attente d'une définition. */
  selectedLeft?: number;
};

/** Hachage FNV-1a 32 bits : graine stable dérivée d'une chaîne. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Mélange déterministe (même graine → même ordre, donc stable entre deux
 * rendus et après une reprise). Ne rend jamais l'ordre d'origine quand il y a
 * au moins deux éléments distincts : la réponse n'est pas donnée d'avance.
 */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const out = [...items];
  let state = hash(seed) || 1;
  const random = () => {
    // xorshift32
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  if (out.length > 1 && out.every((item, i) => item === items[i])) {
    // Rotation d'un cran : l'ordre diffère dès que deux éléments diffèrent.
    out.push(out.shift()!);
  }
  return out;
}

/** Morceaux d'un modèle de texte à trous « Un {{0}} suit des {{1}} ». */
export type TemplatePart = { kind: 'text'; text: string } | { kind: 'blank'; index: number };

export function parseTemplate(template: string): TemplatePart[] {
  const parts: TemplatePart[] = [];
  const re = /\{\{\s*(\d+)\s*\}\}/g;
  let last = 0;
  for (let match = re.exec(template); match; match = re.exec(template)) {
    if (match.index > last) parts.push({ kind: 'text', text: template.slice(last, match.index) });
    parts.push({ kind: 'blank', index: Number(match[1]) });
    last = match.index + match[0].length;
  }
  if (last < template.length) parts.push({ kind: 'text', text: template.slice(last) });
  return parts;
}

/** Nombre de trous : celui de la réponse attendue. */
export const blankCount = (step: Extract<Step, { type: 'fill_blank' }>) => step.answer.length;

/** Ordre d'affichage des définitions d'un exercice d'association (index dans `pairs`). */
export function matchRightOrder(step: Extract<Step, { type: 'match' }>): number[] {
  return seededShuffle(
    step.pairs.map((_, i) => i),
    `${step.id}:right`,
  );
}

/** Banque de mots affichée (mélangée) : index dans `step.bank`. */
export function bankOrder(step: Extract<Step, { type: 'fill_blank' }>): number[] {
  return seededShuffle(
    step.bank.map((_, i) => i),
    `${step.id}:bank`,
  );
}

/** Brouillon de départ : les éléments à ordonner arrivent mélangés. */
export function initialDraft(step: Step): Draft {
  switch (step.type) {
    case 'order':
      return { order: seededShuffle(step.itemsInOrder, step.id) };
    case 'fill_blank':
      return { slots: Array.from({ length: blankCount(step) }, () => null) };
    default:
      return {};
  }
}

/**
 * Réponse prête à vérifier, ou `null` tant que le brouillon est incomplet
 * (le bouton « Vérifier » reste alors désactivé).
 */
export function toAnswer(step: GradedStep, draft: Draft): Answer | null {
  switch (step.type) {
    case 'mcq':
      return draft.choice ? { type: 'mcq', key: draft.choice } : null;
    case 'multi':
      return draft.keys && draft.keys.length > 0 ? { type: 'multi', keys: draft.keys } : null;
    case 'true_false':
      return draft.value === undefined ? null : { type: 'true_false', value: draft.value };
    case 'fill_blank': {
      const slots = draft.slots ?? [];
      if (slots.length < blankCount(step) || slots.some((slot) => slot === null)) return null;
      return { type: 'fill_blank', words: slots.map((slot) => step.bank[slot!] ?? '') };
    }
    case 'order':
      return draft.order ? { type: 'order', items: draft.order } : null;
    case 'match': {
      const links = draft.links ?? {};
      if (Object.keys(links).length < step.pairs.length) return null;
      return {
        type: 'match',
        pairs: step.pairs.map((pair, i) => ({ left: pair.left, right: step.pairs[links[i]!]!.right })),
      };
    }
  }
}

/** multi : coche ou décoche une option. */
export function toggleKey(draft: Draft, key: string): Draft {
  const keys = draft.keys ?? [];
  return { ...draft, keys: keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key] };
}

/** fill_blank : place le mot de la banque dans le premier trou libre. */
export function placeWord(draft: Draft, bankIndex: number): Draft {
  const slots = [...(draft.slots ?? [])];
  if (slots.includes(bankIndex)) return draft;
  const free = slots.indexOf(null);
  if (free === -1) return draft;
  slots[free] = bankIndex;
  return { ...draft, slots };
}

/** fill_blank : vide un trou (le mot retourne dans la banque). */
export function clearSlot(draft: Draft, slotIndex: number): Draft {
  const slots = [...(draft.slots ?? [])];
  if (slotIndex < 0 || slotIndex >= slots.length) return draft;
  slots[slotIndex] = null;
  return { ...draft, slots };
}

/** order : déplace un élément d'un cran (−1 = monter, +1 = descendre). */
export function moveItem(draft: Draft, index: number, delta: -1 | 1): Draft {
  const order = [...(draft.order ?? [])];
  const target = index + delta;
  if (index < 0 || index >= order.length || target < 0 || target >= order.length) return draft;
  [order[index], order[target]] = [order[target]!, order[index]!];
  return { ...draft, order };
}

/**
 * match : touche un terme. Le sélectionne (ou le désélectionne) ; un terme
 * déjà appairé est délié pour pouvoir être refait.
 */
export function tapLeft(draft: Draft, left: number): Draft {
  const links = { ...(draft.links ?? {}) };
  if (links[left] !== undefined) {
    delete links[left];
    return { ...draft, links, selectedLeft: left };
  }
  return { ...draft, selectedLeft: draft.selectedLeft === left ? undefined : left };
}

/**
 * match : touche une définition. Avec un terme sélectionné, les appaire (en
 * retirant l'ancien lien de cette définition) ; sinon, délie la définition.
 */
export function tapRight(draft: Draft, right: number): Draft {
  const links = { ...(draft.links ?? {}) };
  for (const [left, linked] of Object.entries(links)) {
    if (linked === right) delete links[Number(left)];
  }
  if (draft.selectedLeft === undefined) return { ...draft, links };
  links[draft.selectedLeft] = right;
  return { ...draft, links, selectedLeft: undefined };
}

/** match : terme lié à une définition, s'il y en a un. */
export function leftOf(draft: Draft, right: number): number | undefined {
  const entry = Object.entries(draft.links ?? {}).find(([, linked]) => linked === right);
  return entry ? Number(entry[0]) : undefined;
}

/** Au-delà, la bonne réponse n'entre plus dans le titre de la feuille : elle est montrée dans l'étape. */
export const MAX_ANSWER_LABEL = 32;

/**
 * Texte court de la bonne réponse pour le titre de la feuille rouge (second
 * échec), ou `null` quand la réponse est montrée directement dans l'étape
 * (ordre, association, mots trop longs).
 */
export function answerLabel(step: GradedStep, labels: { true: string; false: string }): string | null {
  switch (step.type) {
    case 'mcq':
      return step.answer.toUpperCase();
    case 'multi':
      return step.answers.map((key) => key.toUpperCase()).join(', ');
    case 'true_false':
      return step.answer ? labels.true : labels.false;
    case 'fill_blank': {
      const text = step.answer.join(' · ');
      return text.length <= MAX_ANSWER_LABEL ? text : null;
    }
    case 'order':
    case 'match':
      return null;
  }
}

/** Faut-il garder le brouillon pour la seconde chance ? (corriger plutôt que tout refaire) */
export const keepsDraftOnRetry = (step: Step) =>
  step.type === 'multi' || step.type === 'fill_blank' || step.type === 'order' || step.type === 'match';
