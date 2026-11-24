import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import type { Module } from '@/features/catalog/types';

import { downloadModule, removeModule, type DownloadProgress } from './service';
import { useDownloads } from './store';

export type DownloadState =
  | { status: 'idle' }
  | { status: 'downloading'; progress: DownloadProgress }
  | { status: 'done' }
  | { status: 'error' };

/** Téléchargement d'un module à la demande (jamais automatique : économie de data). */
export function useModuleDownload(module: Pick<Module, 'slug' | 'title' | 'emoji' | 'lessons'> | undefined) {
  const queryClient = useQueryClient();
  const saved = useDownloads((s) => (module ? s.modules[module.slug] : undefined));
  const save = useDownloads((s) => s.save);
  const [state, setState] = useState<DownloadState>({ status: 'idle' });

  const start = useCallback(async () => {
    if (!module || state.status === 'downloading') return;
    setState({ status: 'downloading', progress: { done: 0, total: module.lessons.length * 3 } });
    try {
      const entry = await downloadModule(queryClient, module, (progress) =>
        setState({ status: 'downloading', progress }),
      );
      save(entry);
      setState({ status: 'done' });
    } catch {
      setState({ status: 'error' });
    }
  }, [module, queryClient, save, state.status]);

  const current: DownloadState =
    state.status === 'downloading' || state.status === 'error' ? state : saved ? { status: 'done' } : state;
  return { state: current, saved, start };
}

/** Supprime un module téléchargé (cache + liste). */
export function useRemoveDownload() {
  const queryClient = useQueryClient();
  const forget = useDownloads((s) => s.forget);
  return useCallback(
    (slug: string) => {
      const entry = useDownloads.getState().modules[slug];
      if (entry) removeModule(queryClient, entry);
      forget(slug);
    },
    [forget, queryClient],
  );
}
