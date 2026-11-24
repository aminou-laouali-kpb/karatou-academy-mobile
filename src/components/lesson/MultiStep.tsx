import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { cn } from '@/components/ui/cn';
import type { Phase, Step } from '@/lesson-engine';
import { colors } from '@/theme/tokens';

import { cardTone, QuestionHeader, type Tone } from './common';

type Multi = Extract<Step, { type: 'multi' }>;

/** Choix multiple : cases à cocher, « Plusieurs réponses possibles ». */
export function MultiStep({
  step,
  phase,
  keys,
  onToggle,
  again,
}: {
  step: Multi;
  phase: Phase;
  keys: string[];
  onToggle: (key: string) => void;
  again: boolean;
}) {
  const { t } = useTranslation();
  const locked = phase !== 'answering';
  return (
    <View className="gap-5 pt-4">
      <QuestionHeader prompt={step.prompt} again={again} hint={t('lesson.multiHint')} />
      <View className="gap-3">
        {step.options.map((option) => {
          const on = keys.includes(option.key);
          const isAnswer = step.answers.includes(option.key);
          // 1re erreur : on ne dit pas lesquelles sont justes ; au second échec, tout est montré.
          const tone: Tone =
            phase === 'correct' && on
              ? 'correct'
              : phase === 'incorrect' && on
                ? 'wrong'
                : phase === 'revealed'
                  ? isAnswer
                    ? 'correct'
                    : on
                      ? 'wrong'
                      : 'idle'
                  : on
                    ? 'selected'
                    : 'idle';
          return (
            <Pressable
              key={option.key}
              testID={`multi-${option.key}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on, disabled: locked }}
              accessibilityLabel={`${option.key.toUpperCase()}. ${option.text}`}
              disabled={locked}
              onPress={() => {
                void Haptics.selectionAsync();
                onToggle(option.key);
              }}
              className={cn(
                'min-h-[56px] flex-row items-center gap-3 rounded-lg border-2 border-b-4 px-4 py-3',
                cardTone[tone],
              )}
            >
              <Ionicons
                name={on ? 'checkbox' : 'square-outline'}
                size={26}
                color={
                  tone === 'correct'
                    ? colors.emerald[500]
                    : tone === 'wrong'
                      ? colors.red[500]
                      : on
                        ? colors.blue[500]
                        : colors.gray[400]
                }
              />
              <Text variant="body" className="flex-1">
                {option.text}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
