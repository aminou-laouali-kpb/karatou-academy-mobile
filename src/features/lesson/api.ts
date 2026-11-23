import { useQuery } from '@tanstack/react-query';

import type { Language } from '@/i18n';
import { parseLessonContent, type LessonContent } from '@/lesson-engine';
import { supabase } from '@/lib/supabase';

const DAY = 24 * 60 * 60 * 1000;

export type LessonBody = { body: LessonContent; bodyLang: Language } | null;

async function fetchBody(courseId: string, lang: Language) {
  // `lang` vient de l'ensemble connu (fr, en, ha) : sûr dans le chemin jsonb.
  const { data, error } = await supabase
    .from('karatou_courses')
    .select(`body:lesson_content->${lang}`)
    .eq('id', courseId)
    .maybeSingle();
  if (error) throw error;
  return parseLessonContent((data as { body?: unknown } | null)?.body);
}

/**
 * Corps d'une leçon dans la langue de l'apprenant (une seule langue : léger en 2G),
 * avec repli sur le français. `null` si la leçon n'a pas encore de corps en base.
 * Gardé 30 jours dans le cache persisté : une leçon ouverte reste jouable hors ligne.
 */
export function useLessonBody(courseId: string | undefined, lang: Language) {
  return useQuery({
    queryKey: ['lesson', courseId, lang],
    enabled: Boolean(courseId),
    staleTime: DAY,
    gcTime: 30 * DAY,
    queryFn: async (): Promise<LessonBody> => {
      const own = await fetchBody(courseId!, lang);
      if (own) return { body: own, bodyLang: lang };
      if (lang === 'fr') return null;
      const fr = await fetchBody(courseId!, 'fr');
      return fr ? { body: fr, bodyLang: 'fr' } : null;
    },
  });
}
