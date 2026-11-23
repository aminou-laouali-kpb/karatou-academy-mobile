import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { cn } from '@/components/ui/cn';
import { bankOrder, parseTemplate, type Phase, type Step } from '@/lesson-engine';

import { CorrectAnswerBox, QuestionHeader, type Tone } from './common';

type FillBlank = Extract<Step, { type: 'fill_blank' }>;

const slotTone: Record<Tone, string> = {
  idle: 'border-dashed border-gray-300 bg-gray-100',
  selected: 'border-blue-500 bg-blue-50',
  correct: 'border-emerald-500 bg-emerald-50',
  wrong: 'border-red-500 bg-red-50',
};

/**
 * Texte à trous par appui : toucher un mot de la banque le place dans le
 * premier trou libre ; toucher un trou rempli rend le mot à la banque.
 */
export function FillBlankStep({
  step,
  phase,
  slots,
  onPlace,
  onClear,
  again,
}: {
  step: FillBlank;
  phase: Phase;
  /** Index du mot de la banque placé dans chaque trou. */
  slots: (number | null)[];
  onPlace: (bankIndex: number) => void;
  onClear: (slotIndex: number) => void;
  again: boolean;
}) {
  const { t } = useTranslation();
  const locked = phase !== 'answering';
  const parts = useMemo(() => parseTemplate(step.template), [step.template]);
  const bank = useMemo(() => bankOrder(step), [step]);
  const full = slots.every((slot) => slot !== null);

  // Texte découpé en mots pour un retour à la ligne naturel autour des trous.
  const sentence = (fill: (index: number) => React.ReactNode) =>
    parts.flatMap((part, i) =>
      part.kind === 'blank'
        ? [<View key={`b${i}`}>{fill(part.index)}</View>]
        : part.text
            .split(/(\s+)/)
            .filter((word) => word.trim() !== '')
            .map((word, j) => (
              <Text key={`t${i}-${j}`} variant="body-lg">
                {word}
              </Text>
            )),
    );

  return (
    <View className="gap-5 pt-4">
      <QuestionHeader again={again} hint={t('lesson.fillHint')} />
      <View className="flex-row flex-wrap items-center gap-x-1.5 gap-y-2 rounded-lg border-2 border-gray-200 bg-white p-4">
        {sentence((index) => {
          const bankIndex = slots[index] ?? null;
          const word = bankIndex === null ? null : step.bank[bankIndex];
          const tone: Tone =
            word === null || word === undefined
              ? 'idle'
              : phase === 'answering'
                ? 'selected'
                : word === step.answer[index]
                  ? 'correct'
                  : 'wrong';
          return (
            <Pressable
              testID={`slot-${index}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: locked || word === null }}
              accessibilityLabel={
                word
                  ? t('lesson.blankFilled', { number: index + 1, word })
                  : t('lesson.blankEmpty', { number: index + 1 })
              }
              disabled={locked || word === null}
              onPress={() => {
                void Haptics.selectionAsync();
                onClear(index);
              }}
              className={cn(
                'min-h-[44px] min-w-[72px] items-center justify-center rounded-md border-2 px-3',
                slotTone[tone],
              )}
            >
              <Text variant="body-lg" className="font-body-semibold">
                {word ?? ' '}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="gap-2">
        <Text variant="eyebrow">{t('lesson.wordBank')}</Text>
        <View className="flex-row flex-wrap gap-2">
          {bank.map((bankIndex) => {
            const used = slots.includes(bankIndex);
            const word = step.bank[bankIndex]!;
            const disabled = locked || used || full;
            return (
              <Pressable
                key={bankIndex}
                testID={`bank-${bankIndex}`}
                accessibilityRole="button"
                accessibilityState={{ disabled, selected: used }}
                accessibilityLabel={used ? t('lesson.wordUsed', { word }) : word}
                disabled={disabled}
                onPress={() => {
                  void Haptics.selectionAsync();
                  onPlace(bankIndex);
                }}
                className={cn(
                  'min-h-[44px] items-center justify-center rounded-md border-2 border-b-4 px-4',
                  used ? 'border-gray-200 bg-gray-100' : 'border-gray-200 bg-white',
                )}
              >
                {/* Mot placé : la place reste réservée, le mot s'efface (pas de saut de mise en page). */}
                <Text variant="body" className={cn('font-body-medium', used && 'text-gray-100')}>
                  {word}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {phase === 'revealed' ? (
        <CorrectAnswerBox>
          <View className="flex-row flex-wrap items-center gap-x-1.5 gap-y-1">
            {sentence((index) => (
              <Text variant="body-lg" className="font-body-bold text-emerald-700">
                {step.answer[index]}
              </Text>
            ))}
          </View>
        </CorrectAnswerBox>
      ) : null}
    </View>
  );
}
