import {
  answerLabel,
  bankOrder,
  blankCount,
  check,
  clearSlot,
  initialDraft,
  isCorrect,
  keepsDraftOnRetry,
  leftOf,
  matchRightOrder,
  moveItem,
  parseTemplate,
  placeWord,
  seededShuffle,
  startSession,
  tapLeft,
  tapRight,
  toAnswer,
  toggleKey,
  type GradedStep,
  type Step,
} from '..';

type Of<T extends Step['type']> = Extract<Step, { type: T }>;

const fill: Of<'fill_blank'> = {
  type: 'fill_blank',
  id: 'f1',
  template: 'Un {{0}} suit des {{1}}.',
  bank: ['algorithme', 'règles', 'chat', 'règles'],
  answer: ['algorithme', 'règles'],
  explanation: '',
};
const order: Of<'order'> = {
  type: 'order',
  id: 'o1',
  prompt: 'Range',
  itemsInOrder: ['1', '2', '3', '4'],
  explanation: '',
};
const match: Of<'match'> = {
  type: 'match',
  id: 'glossary',
  prompt: '',
  pairs: [
    { left: 'IA', right: 'Machine qui apprend' },
    { left: 'Donnée', right: 'Information brute' },
    { left: 'Modèle', right: 'Programme entraîné' },
  ],
};
const multi: Of<'multi'> = {
  type: 'multi',
  id: 'm1',
  prompt: 'Lesquels ?',
  options: [
    { key: 'a', text: 'x' },
    { key: 'b', text: 'y' },
    { key: 'c', text: 'z' },
  ],
  answers: ['a', 'c'],
  explanation: '',
};
const tf: Of<'true_false'> = { type: 'true_false', id: 't1', statement: 'S', answer: false, explanation: '' };
const mcq: Of<'mcq'> = {
  type: 'mcq',
  id: 'q1',
  prompt: 'Q',
  options: [{ key: 'a', text: 'x' }],
  answer: 'a',
  explanation: '',
};
const labels = { true: 'Vrai', false: 'Faux' };

describe('seededShuffle', () => {
  it('est déterministe et garde les mêmes éléments', () => {
    const a = seededShuffle([1, 2, 3, 4, 5], 'x');
    expect(seededShuffle([1, 2, 3, 4, 5], 'x')).toEqual(a);
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('ne rend jamais l’ordre d’origine', () => {
    for (let i = 0; i < 200; i += 1) {
      expect(seededShuffle(['a', 'b'], `seed-${i}`)).toEqual(['b', 'a']);
      expect(seededShuffle(['a', 'b', 'c'], `s${i}`)).not.toEqual(['a', 'b', 'c']);
    }
  });

  it('gère les listes courtes et une graine vide', () => {
    expect(seededShuffle([], '')).toEqual([]);
    expect(seededShuffle(['seul'], '')).toEqual(['seul']);
    expect(seededShuffle(['a', 'a'], 'z')).toEqual(['a', 'a']);
  });
});

describe('parseTemplate', () => {
  it('découpe texte et trous', () => {
    expect(parseTemplate('Un {{0}} suit des {{ 1 }}.')).toEqual([
      { kind: 'text', text: 'Un ' },
      { kind: 'blank', index: 0 },
      { kind: 'text', text: ' suit des ' },
      { kind: 'blank', index: 1 },
      { kind: 'text', text: '.' },
    ]);
    expect(parseTemplate('{{0}}')).toEqual([{ kind: 'blank', index: 0 }]);
    expect(parseTemplate('sans trou')).toEqual([{ kind: 'text', text: 'sans trou' }]);
  });
});

describe('initialDraft', () => {
  it('mélange l’ordre, prépare les trous, vide sinon', () => {
    const draft = initialDraft(order);
    expect(draft.order).toHaveLength(4);
    expect(draft.order).not.toEqual(order.itemsInOrder);
    expect(initialDraft(fill)).toEqual({ slots: [null, null] });
    expect(initialDraft(mcq)).toEqual({});
    expect(blankCount(fill)).toBe(2);
  });

  it('banque et définitions mélangées de façon stable', () => {
    expect([...bankOrder(fill)].sort()).toEqual([0, 1, 2, 3]);
    expect(bankOrder(fill)).toEqual(bankOrder(fill));
    expect(matchRightOrder(match)).not.toEqual([0, 1, 2]);
  });
});

describe('toAnswer', () => {
  it('reste null tant que le brouillon est incomplet', () => {
    expect(toAnswer(mcq, {})).toBeNull();
    expect(toAnswer(multi, {})).toBeNull();
    expect(toAnswer(multi, { keys: [] })).toBeNull();
    expect(toAnswer(tf, {})).toBeNull();
    expect(toAnswer(fill, {})).toBeNull();
    expect(toAnswer(fill, { slots: [0, null] })).toBeNull();
    expect(toAnswer(order, {})).toBeNull();
    expect(toAnswer(match, {})).toBeNull();
    expect(toAnswer(match, { links: { 0: 0 } })).toBeNull();
  });

  it('produit une réponse notée juste quand elle l’est', () => {
    const cases: [GradedStep, Parameters<typeof toAnswer>[1]][] = [
      [mcq, { choice: 'a' }],
      [multi, { keys: ['c', 'a'] }],
      [tf, { value: false }],
      [fill, { slots: [0, 3] }],
      [order, { order: ['1', '2', '3', '4'] }],
      [match, { links: { 0: 0, 1: 1, 2: 2 } }],
    ];
    for (const [step, draft] of cases) {
      const answer = toAnswer(step, draft);
      expect(answer).not.toBeNull();
      expect(isCorrect(step, answer!)).toBe(true);
    }
  });

  it('une mauvaise réponse est notée fausse', () => {
    expect(isCorrect(fill, toAnswer(fill, { slots: [2, 1] })!)).toBe(false);
    expect(isCorrect(match, toAnswer(match, { links: { 0: 1, 1: 0, 2: 2 } })!)).toBe(false);
    expect(isCorrect(tf, toAnswer(tf, { value: true })!)).toBe(false);
  });

  it('se branche sur la machine d’état', () => {
    const session = startSession([tf], 0);
    expect(check(session, toAnswer(tf, { value: false })!).phase).toBe('correct');
  });
});

describe('interactions', () => {
  it('multi : coche et décoche', () => {
    const d = toggleKey(toggleKey({}, 'a'), 'b');
    expect(d.keys).toEqual(['a', 'b']);
    expect(toggleKey(d, 'a').keys).toEqual(['b']);
  });

  it('fill_blank : place dans le premier trou libre, refuse un mot déjà placé', () => {
    let d = initialDraft(fill);
    d = placeWord(d, 2);
    expect(d.slots).toEqual([2, null]);
    expect(placeWord(d, 2)).toBe(d);
    d = placeWord(d, 1);
    expect(d.slots).toEqual([2, 1]);
    expect(placeWord(d, 0)).toBe(d); // plus de trou libre
    d = clearSlot(d, 0);
    expect(d.slots).toEqual([null, 1]);
    expect(placeWord(d, 0).slots).toEqual([0, 1]);
    expect(clearSlot(d, 5)).toBe(d);
    expect(clearSlot(d, -1)).toBe(d);
    expect(placeWord({}, 0)).toEqual({});
  });

  it('order : monte et descend, sans sortir de la liste', () => {
    const d = { order: ['a', 'b', 'c'] };
    expect(moveItem(d, 1, -1).order).toEqual(['b', 'a', 'c']);
    expect(moveItem(d, 1, 1).order).toEqual(['a', 'c', 'b']);
    expect(moveItem(d, 0, -1)).toBe(d);
    expect(moveItem(d, 2, 1)).toBe(d);
    expect(moveItem({}, 0, 1)).toEqual({});
  });

  it('match : sélectionne, appaire, délie, réattribue', () => {
    let d = tapLeft({}, 0);
    expect(d.selectedLeft).toBe(0);
    expect(tapLeft(d, 0).selectedLeft).toBe(0);
    d = tapRight(d, 2);
    expect(d.links).toEqual({ 0: 2 });
    expect(d.selectedLeft).toBeUndefined();
    expect(leftOf(d, 2)).toBe(0);
    expect(leftOf(d, 1)).toBeUndefined();
    // Un autre terme prend la même définition : l'ancien lien saute.
    d = tapRight(tapLeft(d, 1), 2);
    expect(d.links).toEqual({ 1: 2 });
    // Toucher un terme lié le délie et le sélectionne.
    d = tapLeft(d, 1);
    expect(d.links).toEqual({});
    expect(d.selectedLeft).toBe(1);
    // Toucher une définition liée sans sélection la délie.
    d = tapRight({ links: { 0: 1 } }, 1);
    expect(d.links).toEqual({});
  });

  it('match : avec le nombre de paires, sélectionne le terme libre suivant', () => {
    let d = tapRight(tapLeft({}, 0), 3, 4);
    expect(d.selectedLeft).toBe(1);
    d = tapRight(d, 0, 4);
    expect(d.selectedLeft).toBe(2);
    // On boucle au début : le terme 3 est appairé, il reste le terme 2… puis plus rien.
    d = tapRight(tapLeft(d, 3), 1, 4);
    expect(d.selectedLeft).toBe(2);
    d = tapRight(d, 2, 4);
    expect(d.links).toEqual({ 0: 3, 1: 0, 3: 1, 2: 2 });
    expect(d.selectedLeft).toBeUndefined();
  });
});

describe('answerLabel', () => {
  it('reste court pour chaque type', () => {
    expect(answerLabel(mcq, labels)).toBe('A');
    expect(answerLabel(multi, labels)).toBe('A, C');
    expect(answerLabel(tf, labels)).toBe('Faux');
    expect(answerLabel({ ...tf, answer: true }, labels)).toBe('Vrai');
    expect(answerLabel(fill, labels)).toBe('algorithme · règles');
    expect(
      answerLabel({ ...fill, answer: ['une très longue réponse', 'qui ne tient pas'] }, labels),
    ).toBeNull();
    expect(answerLabel(order, labels)).toBeNull();
    expect(answerLabel(match, labels)).toBeNull();
  });

  it('garde le brouillon à la seconde chance pour les exercices manipulables', () => {
    expect(keepsDraftOnRetry(order)).toBe(true);
    expect(keepsDraftOnRetry(match)).toBe(true);
    expect(keepsDraftOnRetry(mcq)).toBe(false);
    expect(keepsDraftOnRetry(tf)).toBe(false);
  });
});
