import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

import { useAuth } from '@/features/auth/store';
import { classifyStatus, createOfflineQueue, type QueueItem } from '@/lib/offlineQueue';
import { queryClient } from '@/lib/queryClient';
import { Sentry } from '@/lib/sentry';
import { storage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

import { checkAttemptStatus } from './attemptStatus';

const KEY = 'offline-queue-v1';

/**
 * Envoi d'une leçon terminée par la RPC `karatou_record_lesson_attempt` (B2) :
 * le serveur corrige le quiz, écrit la progression et calcule l'XP. La clé
 * d'idempotence est l'`id` de l'élément : un renvoi ne crédite rien de plus.
 */
async function send(item: QueueItem) {
  const { payload } = item;
  const counts = Object.values(payload.results);
  const { data, error, status } = await supabase.rpc('karatou_record_lesson_attempt', {
    payload: {
      attempt_id: item.id,
      module_slug: payload.moduleSlug,
      course_id: payload.courseId,
      language: payload.lang,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      started_at: payload.startedAt,
      finished_at: payload.completedAt,
      graded_steps: counts.length,
      correct_first_try: counts.filter((r) => r === 'firstTry').length,
      correct_after_retry: counts.filter((r) => r === 'afterRetry').length,
      // Pas d'autoplay ni de suivi de lecture : la vidéo n'est jamais comptée vue.
      video_watched: false,
      step_results: Object.entries(payload.results).map(([id, result]) => ({ id, result })),
      ...(payload.quizAnswers ? { quiz_answers: payload.quizAnswers } : {}),
    },
  });
  if (error) throw classifyStatus(status, error);
  checkAttemptStatus((data as { lesson_status?: string } | null)?.lesson_status);
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['progress', item.userId] }),
    queryClient.invalidateQueries({ queryKey: ['learner-home', item.userId] }),
  ]);
}

export const offlineQueue = createOfflineQueue({
  load: () => {
    try {
      return JSON.parse(storage.getString(KEY) ?? '[]') as QueueItem[];
    } catch {
      return [];
    }
  },
  save: (items) => storage.set(KEY, JSON.stringify(items)),
  isOnline: () => onlineManager.isOnline(),
  currentUserId: () => useAuth.getState().session?.user.id ?? null,
  send,
  report: (error, item) => Sentry.captureException(error, { extra: { kind: item.kind, id: item.id } }),
});

/** Vide la file au démarrage, au retour du réseau et à chaque connexion. */
export function startOfflineQueue() {
  void offlineQueue.flush();
  const offOnline = onlineManager.subscribe((online) => {
    if (online) void offlineQueue.flush();
  });
  const offAuth = useAuth.subscribe((state, previous) => {
    if (state.session?.user.id && state.session.user.id !== previous.session?.user.id)
      void offlineQueue.flush();
  });
  return () => {
    offOnline();
    offAuth();
  };
}

/** Éléments en attente de synchronisation (pour l'affichage). */
export function usePendingItems(): QueueItem[] {
  return useSyncExternalStore(offlineQueue.subscribe, offlineQueue.items);
}
