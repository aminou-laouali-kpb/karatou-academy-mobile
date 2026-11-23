import type { QueryClient } from '@tanstack/react-query';

import type { Module } from '@/features/catalog/types';
import { lessonQueryKey, lessonQueryOptions } from '@/features/lesson/api';

import { DOWNLOAD_LANGS, jsonBytes } from './logic';
import type { DownloadedModule } from './store';

export type DownloadProgress = { done: number; total: number };

/**
 * Télécharge le corps de toutes les leçons d'un module dans les 3 langues et
 * les met dans le cache TanStack Query persisté (mêmes clés et même requête
 * que le lecteur) : la leçon s'ouvre ensuite en mode avion.
 *
 * Une requête à la fois (doux en 2G) ; une erreur arrête tout et rien n'est
 * marqué téléchargé (les leçons déjà reçues restent en cache).
 */
export async function downloadModule(
  queryClient: QueryClient,
  module: Pick<Module, 'slug' | 'title' | 'emoji' | 'lessons'>,
  onProgress?: (progress: DownloadProgress) => void,
  now: () => number = Date.now,
): Promise<DownloadedModule> {
  const jobs = module.lessons.flatMap((lesson) => DOWNLOAD_LANGS.map((lang) => ({ id: lesson.id, lang })));
  let bytes = 0;
  onProgress?.({ done: 0, total: jobs.length });
  for (const [index, job] of jobs.entries()) {
    const data = await queryClient.fetchQuery({
      ...lessonQueryOptions(job.id, job.lang),
      // Toujours la version du serveur, et gardée tant que le module n'est pas supprimé.
      staleTime: 0,
      gcTime: Infinity,
    });
    // Le repli français est compté une fois par langue : c'est ce qui est stocké.
    bytes += jsonBytes(data);
    onProgress?.({ done: index + 1, total: jobs.length });
  }
  return {
    slug: module.slug,
    title: module.title,
    emoji: module.emoji,
    lessonIds: module.lessons.map((lesson) => lesson.id),
    bytes,
    downloadedAt: now(),
  };
}

/** Retire du cache les leçons d'un module téléchargé. */
export function removeModule(queryClient: QueryClient, entry: Pick<DownloadedModule, 'lessonIds'>) {
  for (const id of entry.lessonIds) {
    for (const lang of DOWNLOAD_LANGS)
      queryClient.removeQueries({ queryKey: lessonQueryKey(id, lang), exact: true });
  }
}

/** Nombre de leçons d'un module dont les 3 langues sont bien dans le cache (contrôle d'intégrité). */
export function cachedLessonCount(queryClient: QueryClient, entry: Pick<DownloadedModule, 'lessonIds'>) {
  return entry.lessonIds.filter((id) =>
    DOWNLOAD_LANGS.every((lang) => queryClient.getQueryData(lessonQueryKey(id, lang)) !== undefined),
  ).length;
}
