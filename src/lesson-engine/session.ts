import { isCorrect } from './scoring';
import { isGraded, type Answer, type Step, type StepResult } from './types';

/**
 * Machine d'état d'une leçon (fiche §6.4), en fonctions pures pour être
 * persistée telle quelle (Zustand + MMKV) et reprise après un kill de l'app.
 *
 * - `answering` : l'apprenant répond (ou lit une étape non notée) ;
 * - `correct`   : feuille verte, on attend « Continuer » ;
 * - `incorrect` : feuille rouge, une seconde chance avec « Réessayer » ;
 * - `revealed`  : second échec, la bonne réponse est montrée et la question
 *                 sera reposée en fin de leçon.
 */
export type Phase = 'answering' | 'correct' | 'incorrect' | 'revealed';

export type Session = {
  steps: Step[];
  index: number;
  phase: Phase;
  /** Mauvaises réponses données sur l'étape courante. */
  misses: number;
  /** Résultat par étape notée (identifiant d'origine). */
  results: Record<string, StepResult>;
  /**
   * Dernière réponse de l'apprenant à chaque étape notée, avant que la bonne
   * réponse lui soit montrée (identifiant d'origine). La question reposée en
   * fin de leçon ne la remplace pas : c'est elle que le serveur corrige.
   */
  answers?: Record<string, Answer>;
  startedAt: number;
  finishedAt: number | null;
};

/** Suffixe d'une question reposée en fin de leçon. */
export const REQUEUE_SUFFIX = '~again';

export const baseId = (id: string) =>
  id.endsWith(REQUEUE_SUFFIX) ? id.slice(0, -REQUEUE_SUFFIX.length) : id;
export const isRequeued = (step: Step) => step.id.endsWith(REQUEUE_SUFFIX);

export function startSession(steps: Step[], now: number): Session {
  return {
    steps,
    index: 0,
    phase: 'answering',
    misses: 0,
    results: {},
    startedAt: now,
    finishedAt: steps.length === 0 ? now : null,
  };
}

export function currentStep(session: Session): Step | undefined {
  return session.steps[session.index];
}

/** Vérifie la réponse de l'étape courante (étape notée, phase `answering`). */
export function check(session: Session, answer: Answer): Session {
  const step = currentStep(session);
  if (!step || !isGraded(step) || session.phase !== 'answering') return session;
  const id = baseId(step.id);
  const answers = isRequeued(step) ? session.answers : { ...session.answers, [id]: answer };

  if (isCorrect(step, answer)) {
    // Une question reposée garde son résultat « failed » : elle est seulement passée.
    const results = isRequeued(step)
      ? session.results
      : { ...session.results, [id]: session.misses === 0 ? ('firstTry' as const) : ('afterRetry' as const) };
    return { ...session, phase: 'correct', results, answers };
  }

  // La question reposée n'a qu'un essai : la réponse est montrée, puis on continue.
  if (session.misses === 0 && !isRequeued(step))
    return { ...session, phase: 'incorrect', misses: 1, answers };

  const steps = isRequeued(step)
    ? session.steps
    : [...session.steps, { ...step, id: `${step.id}${REQUEUE_SUFFIX}` }];
  return {
    ...session,
    steps,
    phase: 'revealed',
    misses: session.misses + 1,
    answers,
    results: isRequeued(step) ? session.results : { ...session.results, [id]: 'failed' },
  };
}

/** « Réessayer » après une première erreur. */
export function retry(session: Session): Session {
  return session.phase === 'incorrect' ? { ...session, phase: 'answering' } : session;
}

/** Vrai quand « Continuer » est permis sur l'étape courante. */
export function canAdvance(session: Session): boolean {
  const step = currentStep(session);
  if (!step) return false;
  if (!isGraded(step)) return true;
  return session.phase === 'correct' || session.phase === 'revealed';
}

/** Passe à l'étape suivante ; la leçon se termine après la dernière. */
export function advance(session: Session, now: number): Session {
  if (!canAdvance(session)) return session;
  const index = session.index + 1;
  return {
    ...session,
    index,
    phase: 'answering',
    misses: 0,
    finishedAt: index >= session.steps.length ? now : null,
  };
}

export const isFinished = (session: Session) => session.finishedAt !== null;

/** Avancement de 0 à 1 pour la barre segmentée. */
export function progressOf(session: Session): number {
  if (session.steps.length === 0) return 1;
  return Math.min(1, session.index / session.steps.length);
}

/** Résultats des étapes notées, dans l'ordre de la leçon. */
export function resultsOf(session: Session) {
  return Object.values(session.results);
}
