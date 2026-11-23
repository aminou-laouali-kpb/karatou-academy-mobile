/**
 * Questions de l'onboarding (fiche §4 et E02) : 1 par écran.
 * Les libellés sont dans `onboarding.<question>.<option>` (fr/en/ha.json).
 */
export const GOALS = ['career', 'studies', 'business', 'daily', 'curiosity'] as const;
export const LEVELS = ['beginner', 'basics', 'confident'] as const;
export const MOMENTS = ['morning', 'midday', 'evening', 'night'] as const;
/** Objectifs quotidiens (§7.3) : Léger 30 XP, Régulier 60 XP, Intense 100 XP. */
export const DAILY_GOALS = [
  { key: 'light', xp: 30, minutes: 5 },
  { key: 'regular', xp: 60, minutes: 10 },
  { key: 'intense', xp: 100, minutes: 20 },
] as const;
/** Heures de rappel proposées ; `null` = pas de rappel. */
export const REMINDER_TIMES = ['07:00', '12:30', '19:00', '21:00'] as const;

export type Goal = (typeof GOALS)[number];
export type Level = (typeof LEVELS)[number];
export type Moment = (typeof MOMENTS)[number];
export type DailyGoalXp = (typeof DAILY_GOALS)[number]['xp'];
export type ReminderTime = (typeof REMINDER_TIMES)[number];

/** Ordre des écrans de questions. La langue est la 1ʳᵉ question. */
export const QUESTION_STEPS = ['language', 'goal', 'level', 'moment', 'dailyGoal', 'reminder'] as const;
export type QuestionStep = (typeof QUESTION_STEPS)[number];

export function isQuestionStep(value: unknown): value is QuestionStep {
  return typeof value === 'string' && (QUESTION_STEPS as readonly string[]).includes(value);
}

/** Écran suivant : la question suivante, ou le plan d'apprentissage après la dernière. */
export function nextStep(step: QuestionStep): QuestionStep | 'plan' {
  const index = QUESTION_STEPS.indexOf(step);
  return QUESTION_STEPS[index + 1] ?? 'plan';
}

/** Heure de rappel suggérée selon le moment choisi. */
export function suggestedReminder(moment: Moment | undefined): ReminderTime {
  switch (moment) {
    case 'morning':
      return '07:00';
    case 'midday':
      return '12:30';
    case 'night':
      return '21:00';
    default:
      return '19:00';
  }
}
