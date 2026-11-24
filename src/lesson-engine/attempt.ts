import type { Session } from './session';
import type { Step } from './types';

/** Identifiant des questions du quiz de la leçon (`q1`, `q2`…, cf. lessonToSteps). */
const QUIZ_ID = /^q(\d+)$/;

type Mcq = Extract<Step, { type: 'mcq' }>;

/** Questions du quiz, dans l'ordre de `lesson_content.quiz`. */
function quizSteps(session: Session): Mcq[] {
  return session.steps
    .filter((step): step is Mcq => step.type === 'mcq' && QUIZ_ID.test(step.id))
    .sort((a, b) => Number(QUIZ_ID.exec(a.id)![1]) - Number(QUIZ_ID.exec(b.id)![1]));
}

/**
 * Réponses envoyées au serveur pour la correction du quiz : pour chaque
 * question, la dernière réponse donnée AVANT que la bonne soit montrée. Une
 * question ratée deux fois compte donc fausse, même si l'apprenant la réussit
 * quand elle est reposée en fin de leçon (comme sur le web : un seul essai noté).
 */
export function quizAnswers(session: Session): string[] {
  return quizSteps(session).map((step) => {
    const answer = session.answers?.[step.id];
    return answer?.type === 'mcq' ? answer.key.toUpperCase() : '';
  });
}

/**
 * Le quiz sera-t-il validé par le serveur ? Estimation locale pour l'écran de
 * fin et l'affichage hors ligne ; le serveur fait foi. Vrai sans quiz.
 */
export function quizPassed(session: Session): boolean {
  const steps = quizSteps(session);
  if (steps.length === 0) return true;
  const correct = steps.filter((step) => {
    const answer = session.answers?.[step.id];
    return answer?.type === 'mcq' && answer.key === step.answer;
  }).length;
  // Même seuil que `karatou_submit_quiz` : au moins 70 % de bonnes réponses.
  return correct * 10 >= steps.length * 7;
}

/** Compteurs de la tentative pour `karatou_record_lesson_attempt`. */
export function attemptCounts(session: Session) {
  const results = Object.values(session.results);
  return {
    gradedSteps: results.length,
    correctFirstTry: results.filter((r) => r === 'firstTry').length,
    correctAfterRetry: results.filter((r) => r === 'afterRetry').length,
  };
}
