import type { Language } from '@/i18n';
import type { Json } from '@/lib/database.types';

import type { Catalog, Lesson, Module, Rubrique } from './types';

/**
 * Conversion des lignes Supabase en catalogue, dans la langue de l'apprenant.
 * Comme sur le web (`localizeModule`) : le français est dans les colonnes,
 * les autres langues dans `translations.{en,ha}` ; champ absent = français.
 */

type Translations = Partial<Record<Language, Record<string, unknown>>>;

export type CourseRow = {
  id: string;
  title: string;
  description: string;
  duration: string;
  display_order: number;
  status: string;
  translations: Json;
};

export type ModuleRow = {
  id: string;
  slug: string;
  rubrique_id: string | null;
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  color: string;
  duration: string;
  level: string;
  is_free: boolean;
  display_order: number;
  intro_video: Json;
  translations: Json;
  karatou_courses: CourseRow[];
};

export type RubriqueRow = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  display_order: number;
};

function pick(translations: Json, lang: Language, key: string, fallback: string): string {
  if (lang === 'fr' || !translations || typeof translations !== 'object' || Array.isArray(translations))
    return fallback;
  const value = (translations as Translations)[lang]?.[key];
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function videosOf(value: Json): Partial<Record<Language, string>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const out: Partial<Record<Language, string>> = {};
  for (const lang of ['fr', 'en', 'ha'] as const) {
    const url = (value as Record<string, unknown>)[lang];
    if (typeof url === 'string' && url) out[lang] = url;
  }
  return out;
}

export function toLesson(row: CourseRow, lang: Language): Lesson {
  return {
    id: row.id,
    title: pick(row.translations, lang, 'title', row.title),
    description: pick(row.translations, lang, 'description', row.description),
    duration: row.duration,
  };
}

export function toModule(row: ModuleRow, lang: Language): Module {
  return {
    id: row.id,
    slug: row.slug,
    rubriqueId: row.rubrique_id,
    title: pick(row.translations, lang, 'title', row.title),
    subtitle: pick(row.translations, lang, 'subtitle', row.subtitle),
    description: pick(row.translations, lang, 'description', row.description),
    emoji: row.emoji,
    color: row.color,
    duration: row.duration,
    level: pick(row.translations, lang, 'level', row.level),
    isFree: row.is_free,
    introVideo: videosOf(row.intro_video),
    // Seules les leçons publiées comptent (comme le certificat, après le correctif B3).
    lessons: [...row.karatou_courses]
      .filter((c) => c.status === 'published')
      .sort((a, b) => a.display_order - b.display_order)
      .map((c) => toLesson(c, lang)),
  };
}

export function toCatalog(modules: ModuleRow[], rubriques: RubriqueRow[], lang: Language): Catalog {
  return {
    rubriques: [...rubriques]
      .sort((a, b) => a.display_order - b.display_order)
      .map((r): Rubrique => ({ id: r.id, slug: r.slug, name: r.name, icon: r.icon, color: r.color })),
    modules: [...modules]
      .sort((a, b) => a.display_order - b.display_order)
      .map((m) => toModule(m, lang))
      .filter((m) => m.lessons.length > 0),
  };
}

/**
 * Niveau → clé i18n quand la base n'a que le libellé français
 * (`Débutant`, `Intermédiaire`, `Avancé`). `null` = afficher tel quel.
 */
export function levelKey(level: string): 'beginner' | 'intermediate' | 'advanced' | null {
  const l = level.trim().toLowerCase();
  if (l.startsWith('débutant') || l === 'beginner') return 'beginner';
  if (l.startsWith('intermédiaire') || l === 'intermediate') return 'intermediate';
  if (l.startsWith('avancé') || l === 'advanced') return 'advanced';
  return null;
}

/** Vidéo d'intro dans la langue, sinon en français (avec l'info du repli). */
export function introVideoFor(module: Module, lang: Language): { url: string; lang: Language } | null {
  const own = module.introVideo[lang];
  if (own) return { url: own, lang };
  const fr = module.introVideo.fr;
  return fr ? { url: fr, lang: 'fr' } : null;
}

/** Identifiant YouTube d'une URL embed, watch ou youtu.be. */
export function youtubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  return match?.[1] ?? null;
}
