import * as Crypto from 'expo-crypto';

import { accuracy, estimateXp, resultsOf, type Session } from '@/lesson-engine';

import { offlineQueue } from './queue';
import type { LessonSummary } from './store';

type FinishInput = {
  userId: string;
  moduleSlug: string;
  courseId: string;
  title: string;
  lang: string;
  session: Session;
  /** La leçon n'était pas encore cochée (web ou mobile). */
  firstCompletion: boolean;
  /** `false` pour un aperçu : rien n'est mis dans la file. */
  send?: boolean;
  now?: Date;
};

/**
 * Fin de leçon : la tentative part dans la file hors ligne (envoyée tout de
 * suite si le réseau le permet) et l'écran E09 reçoit un bilan local.
 * L'XP affiché est une estimation : la base fera foi (S6).
 */
export function finishLesson(input: FinishInput): LessonSummary {
  const now = input.now ?? new Date();
  const results = resultsOf(input.session);
  const attemptId = Crypto.randomUUID();
  if (input.send !== false) enqueueAttempt(attemptId, input, now);
  return {
    moduleSlug: input.moduleSlug,
    courseId: input.courseId,
    title: input.title,
    xp: estimateXp(results, input.firstCompletion),
    accuracy: accuracy(results),
    gradedCount: results.length,
    durationMs: now.getTime() - input.session.startedAt,
    firstCompletion: input.firstCompletion,
    attemptId,
    sent: input.send !== false,
  };
}

function enqueueAttempt(attemptId: string, input: FinishInput, now: Date) {
  offlineQueue.enqueue({
    id: attemptId,
    kind: 'lesson_completed',
    userId: input.userId,
    payload: {
      moduleSlug: input.moduleSlug,
      courseId: input.courseId,
      lang: input.lang,
      results: input.session.results,
      startedAt: new Date(input.session.startedAt).toISOString(),
      completedAt: now.toISOString(),
    },
  });
  void offlineQueue.flush();
}
