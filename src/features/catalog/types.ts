import type { Language } from '@/i18n';

export type Rubrique = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  /** Classes Tailwind du web (`from-blue-800 to-blue-600`), traduites par moduleGradient(). */
  color: string;
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  duration: string;
};

export type Module = {
  id: string;
  slug: string;
  rubriqueId: string | null;
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  color: string;
  duration: string;
  level: string;
  isFree: boolean;
  /** URL YouTube par langue ; souvent seulement `fr`. */
  introVideo: Partial<Record<Language, string>>;
  lessons: Lesson[];
};

export type Catalog = { rubriques: Rubrique[]; modules: Module[] };

/** Une leçon terminée (ligne de `karatou_learner_progress`, partagée avec le web). */
export type ProgressRow = { moduleSlug: string; courseId: string; completedAt: string };
