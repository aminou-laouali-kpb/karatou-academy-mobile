import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Session, XpBreakdown } from '@/lesson-engine';
import { mmkvJSONStorage } from '@/lib/persistStorage';

/** Leçon en cours, reprise après un appel entrant ou un kill de l'app (fiche §6.5). */
export type ActiveLesson = {
  /** `module/cours/langue` */
  key: string;
  session: Session;
};

/** Bilan affiché sur l'écran de fin de leçon (E09). */
export type LessonSummary = {
  moduleSlug: string;
  courseId: string;
  title: string;
  xp: XpBreakdown;
  accuracy: number;
  gradedCount: number;
  durationMs: number;
  firstCompletion: boolean;
  /** Clé d'idempotence de la tentative envoyée par la file hors ligne. */
  attemptId: string;
  /** `false` pour un aperçu (écran dev) : rien n'a été mis dans la file. */
  sent: boolean;
};

type LessonState = {
  active: ActiveLesson | null;
  /** Réponses aux questions de réflexion, gardées sur le téléphone (v1). */
  reflections: Record<string, string>;
  lastSummary: LessonSummary | null;
  setActive: (active: ActiveLesson | null) => void;
  setReflection: (key: string, text: string) => void;
  setLastSummary: (summary: LessonSummary | null) => void;
};

export const lessonKey = (moduleSlug: string, courseId: string, lang: string) =>
  `${moduleSlug}/${courseId}/${lang}`;

export const useLessonStore = create<LessonState>()(
  persist(
    (set) => ({
      active: null,
      reflections: {},
      lastSummary: null,
      setActive: (active) => set({ active }),
      setReflection: (key, text) => set((state) => ({ reflections: { ...state.reflections, [key]: text } })),
      setLastSummary: (lastSummary) => set({ lastSummary }),
    }),
    { name: 'lesson-v1', storage: mmkvJSONStorage },
  ),
);
