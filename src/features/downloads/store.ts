import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { mmkvJSONStorage } from '@/lib/persistStorage';

/** Un module téléchargé : ses leçons sont dans le cache persisté sous ['lesson', id, lang]. */
export type DownloadedModule = {
  slug: string;
  title: string;
  emoji: string;
  lessonIds: string[];
  /** Taille approximative des corps de leçon (octets, JSON). */
  bytes: number;
  downloadedAt: number;
};

type DownloadsState = {
  modules: Record<string, DownloadedModule>;
  /** Réglage E15 « Vidéos en Wi-Fi uniquement » (désactivé par défaut). */
  videosWifiOnly: boolean;
  save: (entry: DownloadedModule) => void;
  forget: (slug: string) => void;
  setVideosWifiOnly: (value: boolean) => void;
};

export const useDownloads = create<DownloadsState>()(
  persist(
    (set) => ({
      modules: {},
      videosWifiOnly: false,
      save: (entry) => set((s) => ({ modules: { ...s.modules, [entry.slug]: entry } })),
      forget: (slug) =>
        set((s) => {
          const { [slug]: _removed, ...modules } = s.modules;
          return { modules };
        }),
      setVideosWifiOnly: (videosWifiOnly) => set({ videosWifiOnly }),
    }),
    { name: 'downloads', storage: mmkvJSONStorage, version: 1 },
  ),
);
