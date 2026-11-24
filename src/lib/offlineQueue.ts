/**
 * File d'envoi hors ligne (règle n° 5 du projet).
 *
 * Toute écriture de progression passe par ici : l'élément est d'abord
 * enregistré dans MMKV (il survit à un kill de l'app), puis envoyé dès que le
 * réseau le permet. Chaque élément porte une clé d'idempotence (`id`) : le
 * renvoyer ne crée jamais de doublon côté serveur.
 */

export type LessonCompletedPayload = {
  moduleSlug: string;
  courseId: string;
  /** Langue de la version de la leçon affichée (celle dont le serveur corrige le quiz). */
  lang: string;
  /** Résultats des étapes notées, par identifiant d'étape. */
  results: Record<string, 'firstTry' | 'afterRetry' | 'failed'>;
  /** Réponse à chaque question du quiz, dans l'ordre de `lesson_content.quiz`. */
  quizAnswers?: string[];
  /** Estimation locale : le quiz atteint 70 %. Le serveur fait foi. */
  quizPassed?: boolean;
  startedAt: string;
  completedAt: string;
};

export type QueueItem = {
  /** Clé d'idempotence de la tentative. */
  id: string;
  kind: 'lesson_completed';
  userId: string;
  payload: LessonCompletedPayload;
  createdAt: string;
  attempts: number;
};

/** Erreur définitive (données refusées par le serveur) : l'élément est retiré. */
export class PermanentError extends Error {}

export type QueueDeps = {
  load: () => QueueItem[];
  save: (items: QueueItem[]) => void;
  isOnline: () => boolean;
  currentUserId: () => string | null;
  send: (item: QueueItem) => Promise<void>;
  report: (error: unknown, item: QueueItem) => void;
};

export function createOfflineQueue(deps: QueueDeps) {
  let items = deps.load();
  let flushing: Promise<void> | null = null;
  const listeners = new Set<() => void>();

  const commit = (next: QueueItem[]) => {
    items = next;
    deps.save(items);
    listeners.forEach((listener) => listener());
  };

  async function runFlush() {
    const userId = deps.currentUserId();
    // Seuls les éléments du compte connecté partent ; les autres attendent leur compte.
    for (const item of items.filter((i) => i.userId === userId)) {
      if (!deps.isOnline()) return;
      try {
        await deps.send(item);
        commit(items.filter((i) => i.id !== item.id));
      } catch (error) {
        if (error instanceof PermanentError) {
          deps.report(error, item);
          commit(items.filter((i) => i.id !== item.id));
        } else {
          // Erreur passagère (réseau, serveur) : on réessaiera au prochain retour en ligne.
          commit(items.map((i) => (i.id === item.id ? { ...i, attempts: i.attempts + 1 } : i)));
          return;
        }
      }
    }
  }

  return {
    enqueue(item: Omit<QueueItem, 'attempts' | 'createdAt'>, now = new Date()) {
      if (items.some((i) => i.id === item.id)) return;
      commit([...items, { ...item, attempts: 0, createdAt: now.toISOString() }]);
    },
    /** Envoie ce qui peut l'être ; un seul envoi à la fois. */
    flush(): Promise<void> {
      if (!flushing) {
        flushing = runFlush().finally(() => {
          flushing = null;
        });
      }
      return flushing;
    },
    items: () => items,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export type OfflineQueue = ReturnType<typeof createOfflineQueue>;

/** Statut HTTP d'une réponse Supabase → erreur passagère ou définitive. */
export function classifyStatus(status: number | undefined, error: { message?: string }): Error {
  const message = error.message ?? 'offline queue error';
  if (!status || status >= 500 || status === 408 || status === 429) return new Error(message);
  return new PermanentError(message);
}
