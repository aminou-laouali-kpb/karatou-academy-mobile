import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { cn } from '@/components/ui/cn';
import type { Phase, Step } from '@/lesson-engine';
import { colors } from '@/theme/tokens';

import { badgeTone, cardTone, CorrectAnswerBox, QuestionHeader, verdictTone } from './common';

type Order = Extract<Step, { type: 'order' }>;

/** Remise en ordre par boutons ▲ ▼ (plus sûr qu'un glisser-déposer sur Android d'entrée de gamme). */
export function OrderStep({
  step,
  phase,
  order,
  onMove,
  again,
}: {
  step: Order;
  phase: Phase;
  order: string[];
  onMove: (index: number, delta: -1 | 1) => void;
  again: boolean;
}) {
  const { t } = useTranslation();
  const locked = phase !== 'answering';

  const arrow = (index: number, delta: -1 | 1, item: string) => {
    const disabled = locked || index + delta < 0 || index + delta >= order.length;
    return (
      <Pressable
        testID={`order-${delta < 0 ? 'up' : 'down'}-${index}`}
        accessibilityRole="button"
        accessibilityLabel={t(delta < 0 ? 'lesson.moveUp' : 'lesson.moveDown', { item })}
        accessibilityState={{ disabled }}
        disabled={disabled}
        hitSlop={4}
        onPress={() => {
          void Haptics.selectionAsync();
          onMove(index, delta);
        }}
        className={cn(
          'h-11 w-11 items-center justify-center rounded-md',
          disabled ? 'opacity-30' : 'bg-gray-100',
        )}
      >
        <Ionicons name={delta < 0 ? 'chevron-up' : 'chevron-down'} size={24} color={colors.gray[700]} />
      </Pressable>
    );
  };

  return (
    <View className="gap-5 pt-4">
      <QuestionHeader prompt={step.prompt} again={again} hint={t('lesson.orderHint')} />
      <View className="gap-3">
        {order.map((item, index) => {
          const tone = verdictTone(phase, step.itemsInOrder[index] === item, 'idle');
          return (
            <View
              key={item}
              testID={`order-item-${index}`}
              accessible={false}
              className={cn(
                'min-h-[60px] flex-row items-center gap-3 rounded-lg border-2 py-2 pl-3 pr-2',
                cardTone[tone],
              )}
            >
              <View
                className={cn(
                  'h-8 w-8 items-center justify-center rounded-full border-2',
                  tone === 'idle' ? 'border-gray-200' : badgeTone[tone],
                )}
              >
                <Text variant="label" className={tone === 'idle' ? 'text-gray-600' : 'text-white'}>
                  {index + 1}
                </Text>
              </View>
              <Text
                variant="body"
                className="flex-1"
                accessibilityLabel={t('lesson.orderPosition', { number: index + 1, item })}
              >
                {item}
              </Text>
              <View className="flex-row gap-1">
                {arrow(index, -1, item)}
                {arrow(index, 1, item)}
              </View>
            </View>
          );
        })}
      </View>
      {phase === 'revealed' ? (
        <CorrectAnswerBox>
          {step.itemsInOrder.map((item, index) => (
            <Text key={item} variant="body">
              <Text variant="body" className="font-body-bold text-emerald-700">
                {index + 1}.{' '}
              </Text>
              {item}
            </Text>
          ))}
        </CorrectAnswerBox>
      ) : null}
    </View>
  );
}
