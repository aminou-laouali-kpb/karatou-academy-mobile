import { useQuery } from '@tanstack/react-query';

import type { Language } from '@/i18n';
import { parseLessonContent, type LessonContent } from '@/lesson-engine';
import { supabase } from '@/lib/supabase';

const DAY = 24 * 60 * 60 * 1000;

export type LessonBody = { body: LessonContent; bodyLang: Language } | null;

/** Clé du cache d'un corps de leçon : partagée par le lecteur et les téléchargements (E17). */
export const lessonQueryKey = (courseId: string, lang: Language) => ['lesson', courseId, lang] as const;

async function fetchBody(courseId: string, lang: Language) {
  // `lang` vient de l'ensemble connu (fr, en, ha) : sûr dans le chemin jsonb.
  // TODO(interactive_steps) : lire aussi `interactive_steps->lang` quand la colonne existera
  // (migration dans le repo web), et la passer au lecteur via la prop `steps`.
  const { data, error } = await supabase
    .from('karatou_courses')
    .select(`body:lesson_content->${lang}`)
    .eq('id', courseId)
    .maybeSingle();
  if (error) throw error;
  return parseLessonContent((data as { body?: unknown } | null)?.body);
}

/**
 * Corps d'une leçon dans une langue (une seule langue par requête : léger en 2G),
 * avec repli sur le français. `null` si la leçon n'a pas encore de corps en base.
 */
export async function fetchLessonBody(courseId: string, lang: Language): Promise<LessonBody> {
  const own = await fetchBody(courseId, lang);
  if (own) return { body: own, bodyLang: lang };
  if (lang === 'fr') return null;
  const fr = await fetchBody(courseId, 'fr');
  return fr ? { body: fr, bodyLang: 'fr' } : null;
}

/** Options de requête d'un corps de leçon (gardé 30 jours dans le cache persisté). */
export const lessonQueryOptions = (courseId: string, lang: Language) => ({
  queryKey: lessonQueryKey(courseId, lang),
  staleTime: DAY,
  gcTime: 30 * DAY,
  queryFn: () => fetchLessonBody(courseId, lang),
});

/** Corps de la leçon pour le lecteur : une leçon ouverte (ou téléchargée) reste jouable hors ligne. */
export function useLessonBody(courseId: string | undefined, lang: Language) {
  return useQuery({ ...lessonQueryOptions(courseId ?? '', lang), enabled: Boolean(courseId) });
}
