import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';

import { storage } from './storage';

const DAY = 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 7 * DAY, // garde le cache une semaine pour le mode hors ligne
      staleTime: 5 * 60 * 1000,
      retry: 2,
      networkMode: 'offlineFirst',
    },
    mutations: { networkMode: 'offlineFirst' },
  },
});

/** Durée de vie du cache persisté (le catalogue reste lisible un mois en mode avion). */
export const PERSIST_MAX_AGE = 30 * DAY;

/** Persiste le cache TanStack Query dans MMKV (catalogue lisible en mode avion). */
export const queryPersister = createSyncStoragePersister({
  storage: {
    getItem: (key) => storage.getString(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => {
      storage.remove(key);
    },
  },
});
