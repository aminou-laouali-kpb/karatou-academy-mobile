import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

import { useAuth } from '@/features/auth/store';
import { classifyStatus, createOfflineQueue, type QueueItem } from '@/lib/offlineQueue';
import { queryClient } from '@/lib/queryClient';
import { Sentry } from '@/lib/sentry';
import { storage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

const KEY = 'offline-queue-v1';

/**
 * Envoi d'une leçon terminée. En attendant la RPC `karatou_record_lesson_attempt`
 * (piste B2, branchée en S6), on écrit comme le web : un upsert dans
 * `karatou_learner_progress` qui garde la date de la première fois.
 */
async function send(item: QueueItem) {
  const { status, error } = await supabase.from('karatou_learner_progress').upsert(
    {
      user_id: item.userId,
      module_slug: item.payload.moduleSlug,
      course_id: item.payload.courseId,
      completed_at: item.payload.completedAt,
    },
    { onConflict: 'user_id,module_slug,course_id', ignoreDuplicates: true },
  );
  if (error) throw classifyStatus(status, error);
  await queryClient.invalidateQueries({ queryKey: ['progress', item.userId] });
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
