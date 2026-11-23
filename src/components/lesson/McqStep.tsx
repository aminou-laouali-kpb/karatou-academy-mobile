import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { cn } from '@/components/ui/cn';
import type { Phase, Step } from '@/lesson-engine';

type Mcq = Extract<Step, { type: 'mcq' }>;

/** Question à choix unique (fiche §6.2) : grandes cartes avec la lettre de l'option. */
export function McqStep({
  step,
  phase,
  choice,
  onChoose,
  again,
}: {
  step: Mcq;
  phase: Phase;
  choice: string | undefined;
  onChoose: (key: string) => void;
  again: boolean;
}) {
  const { t } = useTranslation();
  const locked = phase !== 'answering';
  return (
    <View className="gap-5">
      <View className="gap-2">
        <Text variant="eyebrow" className={again ? 'text-orange-700' : undefined}>
          {again ? t('lesson.againBadge') : t('lesson.question')}
        </Text>
        <Text variant="h2">{step.prompt}</Text>
      </View>
      <View accessibilityRole="radiogroup" className="gap-3">
        {step.options.map((option) => {
          const chosen = choice === option.key;
          const isAnswer = option.key === step.answer;
          const tone =
            phase === 'correct' && chosen
              ? 'correct'
              : (phase === 'incorrect' || phase === 'revealed') && chosen
                ? 'wrong'
                : phase === 'revealed' && isAnswer
                  ? 'correct'
                  : chosen
                    ? 'selected'
                    : 'idle';
          return (
            <Pressable
              key={option.key}
              accessibilityRole="radio"
              accessibilityState={{ checked: chosen, disabled: locked }}
              accessibilityLabel={`${option.key}. ${option.text}`}
              disabled={locked}
              onPress={() => {
                void Haptics.selectionAsync();
                onChoose(option.key);
              }}
            >
              {({ pressed }) => (
                <View
                  className={cn(
                    'min-h-[56px] flex-row items-center gap-3 rounded-lg border-2 border-b-4 px-4 py-3',
                    tone === 'idle' && 'border-gray-200 bg-white',
                    tone === 'selected' && 'border-blue-500 bg-blue-50',
                    tone === 'correct' && 'border-emerald-500 bg-emerald-50',
                    tone === 'wrong' && 'border-red-500 bg-red-50',
                    pressed && !locked && 'bg-gray-50',
                  )}
                >
                  <View
                    className={cn(
                      'h-8 w-8 items-center justify-center rounded-md border-2',
                      tone === 'idle' && 'border-gray-200',
                      tone === 'selected' && 'border-blue-500 bg-blue-500',
                      tone === 'correct' && 'border-emerald-500 bg-emerald-500',
                      tone === 'wrong' && 'border-red-500 bg-red-500',
                    )}
                  >
                    <Text variant="label" className={cn(tone === 'idle' ? 'text-gray-500' : 'text-white')}>
                      {option.key.toUpperCase()}
                    </Text>
                  </View>
                  <Text variant="body" className="flex-1">
                    {option.text}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
