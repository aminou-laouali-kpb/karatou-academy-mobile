import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { cn } from '@/components/ui/cn';
import type { Phase, Step } from '@/lesson-engine';

import { cardTone, QuestionHeader, type Tone } from './common';

type TrueFalse = Extract<Step, { type: 'true_false' }>;

/** Vrai ou faux : l'affirmation dans une carte, deux grands boutons côte à côte. */
export function TrueFalseStep({
  step,
  phase,
  value,
  onChoose,
  again,
}: {
  step: TrueFalse;
  phase: Phase;
  value: boolean | undefined;
  onChoose: (value: boolean) => void;
  again: boolean;
}) {
  const { t } = useTranslation();
  const locked = phase !== 'answering';
  return (
    <View className="gap-5 pt-4">
      <QuestionHeader prompt={t('lesson.trueFalsePrompt')} again={again} />
      <View className="rounded-lg border-2 border-gray-200 bg-white p-4">
        <Text variant="body-lg">{step.statement}</Text>
      </View>
      <View accessibilityRole="radiogroup" className="flex-row gap-3">
        {[true, false].map((option) => {
          const chosen = value === option;
          const tone: Tone =
            phase === 'correct' && chosen
              ? 'correct'
              : (phase === 'incorrect' || phase === 'revealed') && chosen
                ? 'wrong'
                : phase === 'revealed' && option === step.answer
                  ? 'correct'
                  : chosen
                    ? 'selected'
                    : 'idle';
          const label = option ? t('lesson.true') : t('lesson.false');
          return (
            <Pressable
              key={String(option)}
              testID={`tf-${option}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: chosen, disabled: locked }}
              accessibilityLabel={label}
              disabled={locked}
              onPress={() => {
                void Haptics.selectionAsync();
                onChoose(option);
              }}
              className={cn(
                'min-h-[64px] flex-1 items-center justify-center rounded-lg border-2 border-b-4 px-3 py-3',
                cardTone[tone],
              )}
            >
              <Text variant="h3">
                {option ? '👍 ' : '👎 '}
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
