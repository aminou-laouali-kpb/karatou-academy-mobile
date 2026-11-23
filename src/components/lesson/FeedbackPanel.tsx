import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { cn } from '@/components/ui/cn';
import type { Phase } from '@/lesson-engine';

/**
 * Feuille de feedback d'une étape notée (fiche §6.4) : verte si juste,
 * rouge sinon, avec l'explication et le bouton suivant.
 */
export function FeedbackPanel({
  phase,
  explanation,
  answerLabel,
  xp,
  again,
  bottomInset,
  onPress,
}: {
  phase: Exclude<Phase, 'answering'>;
  explanation: string;
  /** Texte de la bonne réponse (seconde erreur). */
  answerLabel: string;
  xp: number;
  /** Question reposée en fin de leçon : elle ne revient pas une 3e fois. */
  again: boolean;
  /** Zone sûre du bas : la feuille colorée descend jusqu'au bord de l'écran. */
  bottomInset: number;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const good = phase === 'correct';
  const title =
    phase === 'correct'
      ? t('lesson.correctTitle')
      : phase === 'incorrect'
        ? t('lesson.incorrectTitle')
        : t('lesson.revealedTitle', { answer: answerLabel });

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility([title, explanation].filter(Boolean).join('. '));
  }, [title, explanation]);

  return (
    <View
      className={cn(
        'gap-3 border-t-2 px-5 pt-4',
        good ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50',
      )}
      style={{ paddingBottom: bottomInset + 8 }}
    >
      <View className="flex-row items-center justify-between gap-3">
        <Text variant="h3" className={cn('flex-1', good ? 'text-emerald-700' : 'text-red-700')}>
          {good ? '✅ ' : '❌ '}
          {title}
        </Text>
        {good && xp > 0 ? (
          <View className="rounded-full bg-gold-100 px-3 py-1">
            <Text variant="label" className="text-gold-700">
              {t('lesson.xpGain', { count: xp })}
            </Text>
          </View>
        ) : null}
      </View>
      {explanation ? <Text variant="body">{explanation}</Text> : null}
      {phase === 'revealed' && !again ? <Text variant="meta">{t('lesson.revealedLater')}</Text> : null}
      <Button
        label={phase === 'incorrect' ? t('lesson.retry') : t('lesson.continue')}
        variant={good ? 'primary' : 'secondary'}
        onPress={onPress}
      />
    </View>
  );
}
