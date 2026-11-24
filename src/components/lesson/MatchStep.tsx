import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { cn } from '@/components/ui/cn';
import { leftOf, matchRightOrder, type Draft, type Phase, type Step } from '@/lesson-engine';

import { cardTone, CorrectAnswerBox, pairTone, QuestionHeader, verdictTone, type Tone } from './common';

type Match = Extract<Step, { type: 'match' }>;

function PairBadge({ index }: { index: number }) {
  return (
    <View
      testID={`pair-badge-${index}`}
      className={cn('h-7 w-7 items-center justify-center rounded-full', pairTone(index))}
    >
      <Text variant="label" className="font-body-bold text-white">
        {index + 1}
      </Text>
    </View>
  );
}

/**
 * Association par appui : toucher un terme, puis sa définition. Chaque paire
 * reçoit un numéro et une couleur. Les termes sont en haut, les définitions
 * (souvent longues) en dessous en pleine largeur : lisible sur petit écran.
 */
export function MatchStep({
  step,
  phase,
  draft,
  onTapLeft,
  onTapRight,
  again,
}: {
  step: Match;
  phase: Phase;
  draft: Draft;
  onTapLeft: (left: number) => void;
  onTapRight: (right: number) => void;
  again: boolean;
}) {
  const { t } = useTranslation();
  const locked = phase !== 'answering';
  const rights = useMemo(() => matchRightOrder(step), [step]);
  const links = draft.links ?? {};
  // Juste si le terme est lié à la définition de sa propre paire.
  const linkRight = (left: number) => links[left] === left;

  return (
    <View className="gap-5 pt-4">
      <QuestionHeader
        prompt={step.prompt || t('lesson.matchPrompt')}
        again={again}
        hint={t('lesson.matchHint')}
      />

      <View className="gap-2">
        <Text variant="eyebrow">{t('lesson.terms')}</Text>
        <View className="flex-row flex-wrap gap-2">
          {step.pairs.map((pair, left) => {
            const linked = links[left] !== undefined;
            const selected = draft.selectedLeft === left;
            const tone: Tone = linked
              ? verdictTone(phase, linkRight(left), 'selected')
              : selected
                ? 'selected'
                : 'idle';
            return (
              <Pressable
                key={left}
                testID={`left-${left}`}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled: locked }}
                accessibilityLabel={
                  linked ? t('lesson.termLinked', { term: pair.left, number: left + 1 }) : pair.left
                }
                disabled={locked}
                onPress={() => {
                  void Haptics.selectionAsync();
                  onTapLeft(left);
                }}
                className={cn(
                  'min-h-[48px] flex-row items-center gap-2 rounded-lg border-2 border-b-4 px-3 py-2',
                  cardTone[tone],
                  selected && 'border-blue-700',
                )}
              >
                {linked ? <PairBadge index={left} /> : null}
                <Text variant="body" className="font-body-semibold">
                  {pair.left}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="gap-2">
        <Text variant="eyebrow">{t('lesson.definitions')}</Text>
        <View className="gap-3">
          {rights.map((right) => {
            const left = leftOf(draft, right);
            const tone: Tone = left === undefined ? 'idle' : verdictTone(phase, left === right, 'selected');
            const text = step.pairs[right]!.right;
            return (
              <Pressable
                key={right}
                testID={`right-${right}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: locked }}
                accessibilityLabel={
                  left === undefined
                    ? text
                    : t('lesson.definitionLinked', { definition: text, term: step.pairs[left]!.left })
                }
                disabled={locked}
                onPress={() => {
                  void Haptics.selectionAsync();
                  onTapRight(right);
                }}
                className={cn(
                  'min-h-[56px] flex-row items-center gap-3 rounded-lg border-2 px-4 py-3',
                  cardTone[tone],
                )}
              >
                {left === undefined ? (
                  <View className="h-7 w-7 rounded-full border-2 border-dashed border-gray-300" />
                ) : (
                  <PairBadge index={left} />
                )}
                <Text variant="body" className="flex-1">
                  {text}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {phase === 'revealed' ? (
        <CorrectAnswerBox>
          {step.pairs.map((pair) => (
            <Text key={pair.left} variant="body">
              <Text variant="body" className="font-body-bold text-emerald-700">
                {pair.left}
              </Text>
              {' → '}
              {pair.right}
            </Text>
          ))}
        </CorrectAnswerBox>
      ) : null}
    </View>
  );
}
