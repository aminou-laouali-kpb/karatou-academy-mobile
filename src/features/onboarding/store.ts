import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { mmkvJSONStorage } from '@/lib/persistStorage';

import type { DailyGoalXp, Goal, Level, Moment, ReminderTime } from './options';

export type OnboardingAnswers = {
  goal?: Goal;
  level?: Level;
  moment?: Moment;
  dailyGoalXp?: DailyGoalXp;
  /** `null` = l'apprenant ne veut pas de rappel. */
  reminderTime?: ReminderTime | null;
};

type OnboardingState = {
  answers: OnboardingAnswers;
  /** Date ISO de fin de l'onboarding (plan affiché). */
  completedAt: string | null;
  /**
   * Date ISO de l'envoi au serveur. Les réponses restent locales tant que la RPC
   * `karatou_update_learning_prefs` (piste B2) n'existe pas.
   */
  syncedAt: string | null;
  setAnswer: <K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => void;
  complete: () => void;
  markSynced: () => void;
  reset: () => void;
};

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set) => ({
      answers: {},
      completedAt: null,
      syncedAt: null,
      setAnswer: (key, value) => set((state) => ({ answers: { ...state.answers, [key]: value } })),
      complete: () => set({ completedAt: new Date().toISOString() }),
      markSynced: () => set({ syncedAt: new Date().toISOString() }),
      reset: () => set({ answers: {}, completedAt: null, syncedAt: null }),
    }),
    { name: 'onboarding.v1', storage: mmkvJSONStorage, version: 1 },
  ),
);
