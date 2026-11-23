import type { Answer, GradedStep, StepResult } from './types';

const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((item) => b.includes(item));
const sameList = <T>(a: T[], b: T[]) => a.length === b.length && a.every((item, index) => item === b[index]);

/** Vrai si la réponse est juste. Comparaison exacte des clés, comme sur le web. */
export function isCorrect(step: GradedStep, answer: Answer): boolean {
  if (answer.type !== step.type) return false;
  switch (step.type) {
    case 'mcq':
      return answer.type === 'mcq' && answer.key === step.answer;
    case 'multi':
      return answer.type === 'multi' && sameSet(answer.keys, step.answers);
    case 'true_false':
      return answer.type === 'true_false' && answer.value === step.answer;
    case 'fill_blank':
      return answer.type === 'fill_blank' && sameList(answer.words, step.answer);
    case 'order':
      return answer.type === 'order' && sameList(answer.items, step.itemsInOrder);
    case 'match':
      return (
        answer.type === 'match' &&
        answer.pairs.length === step.pairs.length &&
        answer.pairs.every((pair) => step.pairs.some((p) => p.left === pair.left && p.right === pair.right))
      );
  }
}

/** Barème d'XP (fiche §7.1). Affichage optimiste : la base fait foi. */
export const XP = {
  lessonCompleted: 20,
  firstTry: 2,
  afterRetry: 1,
  perfect: 10,
  replayRatio: 0.25,
} as const;

export type XpBreakdown = { completion: number; steps: number; perfect: number; total: number };

/**
 * Estimation de l'XP d'une leçon. `firstCompletion` : la leçon n'était pas
 * encore cochée. Une leçon rejouée ne donne que 25 % du bonus, sans les 20 XP.
 */
export function estimateXp(results: StepResult[], firstCompletion: boolean): XpBreakdown {
  const stepsXp = results.reduce(
    (sum, result) =>
      sum + (result === 'firstTry' ? XP.firstTry : result === 'afterRetry' ? XP.afterRetry : 0),
    0,
  );
  const perfectXp = results.length > 0 && results.every((result) => result === 'firstTry') ? XP.perfect : 0;
  const ratio = firstCompletion ? 1 : XP.replayRatio;
  const steps = Math.round(stepsXp * ratio);
  const perfect = Math.round(perfectXp * ratio);
  const completion = firstCompletion ? XP.lessonCompleted : 0;
  return { completion, steps, perfect, total: completion + steps + perfect };
}

/** Part des étapes notées réussies (du 1er ou du 2e coup), de 0 à 1 ; 1 sans étape notée. */
export function accuracy(results: StepResult[]): number {
  if (results.length === 0) return 1;
  return results.filter((result) => result !== 'failed').length / results.length;
}
