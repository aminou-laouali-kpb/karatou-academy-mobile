import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/components/ui';
import type { Phase } from '@/lesson-engine';

/** État visuel d'un élément d'exercice. Vert/rouge réservés au verdict. */
export type Tone = 'idle' | 'selected' | 'correct' | 'wrong';

/** Bord + fond d'une carte selon son état (classes littérales pour NativeWind). */
export const cardTone: Record<Tone, string> = {
  idle: 'border-gray-200 bg-white',
  selected: 'border-blue-500 bg-blue-50',
  correct: 'border-emerald-500 bg-emerald-50',
  wrong: 'border-red-500 bg-red-50',
};

/** Pastille (lettre, case, numéro) selon l'état. */
export const badgeTone: Record<Tone, string> = {
  idle: 'border-gray-200',
  selected: 'border-blue-500 bg-blue-500',
  correct: 'border-emerald-500 bg-emerald-500',
  wrong: 'border-red-500 bg-red-500',
};

/** Couleurs des paires d'association : foncées pour un texte blanc AA ; le numéro double la couleur. */
export const PAIR_TONES = ['bg-blue-700', 'bg-cyan-700', 'bg-orange-700', 'bg-gray-800'] as const;
export const pairTone = (index: number) => PAIR_TONES[index % PAIR_TONES.length]!;

/** Verdict d'un élément dont on sait s'il est juste, selon la phase. */
export function verdictTone(phase: Phase, right: boolean, fallback: Tone): Tone {
  if (phase === 'answering') return fallback;
  return right ? 'correct' : 'wrong';
}

/** En-tête d'une étape notée : « Question » (ou « Question revue ») + énoncé + consigne. */
export function QuestionHeader({ prompt, again, hint }: { prompt?: string; again: boolean; hint?: string }) {
  const { t } = useTranslation();
  return (
    <View className="gap-2">
      <Text variant="eyebrow" className={again ? 'text-orange-700' : undefined}>
        {again ? t('lesson.againBadge') : t('lesson.question')}
      </Text>
      {prompt ? <Text variant="h2">{prompt}</Text> : null}
      {hint ? (
        <Text variant="body" className="text-gray-600">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/** Encadré vert « La bonne réponse » montré après le second échec. */
export function CorrectAnswerBox({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <View testID="correct-answer" className="gap-2 rounded-lg border-2 border-emerald-500 bg-emerald-50 p-4">
      <Text variant="eyebrow" className="text-emerald-700">
        {t('lesson.correctAnswer')}
      </Text>
      {children}
    </View>
  );
}
