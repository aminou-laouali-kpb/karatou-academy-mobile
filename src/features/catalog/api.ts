import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/features/auth/store';
import { isLanguage } from '@/i18n';
import { supabase } from '@/lib/supabase';

import { toCatalog, type ModuleRow, type RubriqueRow } from './localize';
import type { Catalog, ProgressRow } from './types';

const DAY = 24 * 60 * 60 * 1000;

/** Catalogue publié : léger (sans le corps des leçons), mis en cache 24 h, gardé 30 jours hors ligne. */
export function useCatalog() {
  const { i18n } = useTranslation();
  const lang = isLanguage(i18n.language) ? i18n.language : 'fr';
  return useQuery({
    queryKey: ['catalog'],
    staleTime: DAY,
    gcTime: 30 * DAY,
    queryFn: async () => {
      const [modules, rubriques] = await Promise.all([
        supabase
          .from('karatou_modules')
          .select(
            'id, slug, rubrique_id, title, subtitle, description, emoji, color, duration, level, is_free, display_order, intro_video, translations, karatou_courses(id, title, description, duration, display_order, status, translations)',
          )
          .eq('status', 'published')
          .order('display_order'),
        supabase
          .from('karatou_rubriques')
          .select('id, slug, name, icon, color, display_order')
          .eq('status', 'published')
          .order('display_order'),
      ]);
      if (modules.error) throw modules.error;
      if (rubriques.error) throw rubriques.error;
      return { modules: modules.data as ModuleRow[], rubriques: rubriques.data as RubriqueRow[] };
    },
    // La langue s'applique à la lecture : changer de langue ne refait aucune requête.
    select: (data): Catalog => toCatalog(data.modules, data.rubriques, lang),
  });
}

/** Leçons terminées par l'apprenant (sur le web comme sur le mobile). */
export function useProgress() {
  const userId = useAuth((s) => s.session?.user.id);
  return useQuery({
    queryKey: ['progress', userId],
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
    gcTime: 30 * DAY,
    queryFn: async (): Promise<ProgressRow[]> => {
      const { data, error } = await supabase
        .from('karatou_learner_progress')
        .select('module_slug, course_id, completed_at')
        .eq('user_id', userId!);
      if (error) throw error;
      return data.map((r) => ({
        moduleSlug: r.module_slug,
        courseId: r.course_id,
        completedAt: r.completed_at,
      }));
    },
  });
}

/**
 * Langue de la vidéo d'une leçon (pastille de la feuille E07), lue seulement
 * à l'ouverture de la feuille. `null` si la leçon n'a pas encore de corps en base (B1).
 */
export function useLessonVideoLanguage(courseId: string | null) {
  const { i18n } = useTranslation();
  const lang = isLanguage(i18n.language) ? i18n.language : 'fr';
  return useQuery({
    queryKey: ['lesson-video', courseId, lang],
    enabled: Boolean(courseId),
    staleTime: DAY,
    gcTime: 30 * DAY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('karatou_courses')
        .select(`video:lesson_content->${lang}->video`)
        .eq('id', courseId!)
        .maybeSingle();
      if (error) throw error;
      return videoLanguage((data as { video?: unknown } | null)?.video, lang);
    },
  });
}

/** Une vidéo identique à la version française compte comme « en français ». */
export function videoLanguage(video: unknown, lang: 'fr' | 'en' | 'ha'): 'fr' | 'en' | 'ha' | null {
  if (!video || typeof video !== 'object') return null;
  const v = video as Record<string, unknown>;
  const own = typeof v[lang] === 'string' ? (v[lang] as string) : '';
  const fr = typeof v.fr === 'string' ? (v.fr as string) : '';
  if (own && (lang === 'fr' || own !== fr)) return lang;
  return fr ? 'fr' : null;
}
