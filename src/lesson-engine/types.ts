/**
 * Types du moteur de leçon (fiche §6.2). TypeScript pur : aucun import React.
 */
export type Lang = 'fr' | 'en' | 'ha';
export type Option = { key: string; text: string };

export type Step =
  | { type: 'intro'; id: string; title: string; objective: string; estMinutes: number }
  | { type: 'video'; id: string; youtubeId: string; videoLang: Lang }
  | { type: 'explain'; id: string; title?: string; body: string; imageUrl?: string }
  | {
      type: 'predict_reveal';
      id: string;
      title?: string;
      challenge: string;
      solution: string;
      impact: string;
    }
  | { type: 'checklist'; id: string; title: string; items: string[]; observation: string }
  | { type: 'mcq'; id: string; prompt: string; options: Option[]; answer: string; explanation: string }
  | { type: 'multi'; id: string; prompt: string; options: Option[]; answers: string[]; explanation: string }
  | { type: 'true_false'; id: string; statement: string; answer: boolean; explanation: string }
  | {
      type: 'fill_blank';
      id: string;
      /** « Un {{0}} suit des {{1}} » */
      template: string;
      bank: string[];
      answer: string[];
      explanation: string;
    }
  | { type: 'order'; id: string; prompt: string; itemsInOrder: string[]; explanation: string }
  | { type: 'match'; id: string; prompt: string; pairs: { left: string; right: string }[] }
  | { type: 'reflection'; id: string; prompt: string }
  | { type: 'recap'; id: string; points: string[] };

export type StepType = Step['type'];

export const GRADED = ['mcq', 'multi', 'true_false', 'fill_blank', 'order', 'match'] as const;
export type GradedType = (typeof GRADED)[number];
export type GradedStep = Extract<Step, { type: GradedType }>;

export function isGraded(step: Step): step is GradedStep {
  return (GRADED as readonly string[]).includes(step.type);
}

/** Réponse de l'apprenant, selon le type d'étape notée. */
export type Answer =
  | { type: 'mcq'; key: string }
  | { type: 'multi'; keys: string[] }
  | { type: 'true_false'; value: boolean }
  | { type: 'fill_blank'; words: string[] }
  | { type: 'order'; items: string[] }
  | { type: 'match'; pairs: { left: string; right: string }[] };

/** Résultat d'une étape notée (fiche §6.4). */
export type StepResult = 'firstTry' | 'afterRetry' | 'failed';
