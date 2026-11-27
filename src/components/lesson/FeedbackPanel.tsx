import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, View } from 'react-native';
import Animated, {
  FadeIn,
  ReduceMotion,
  SlideInDown,
  useReducedMotion,
  ZoomIn,
} from 'react-native-reanimated';

import { Button, Text } from '@/components/ui';
import { cn } from '@/components/ui/cn';
import type { Phase } from '@/lesson-engine';

/** Durées sobres (fiche §10.4) : la feuille monte vite, la pastille XP « pop » juste après. */
const SHEET_MS = 220;
const XP_DELAY_MS = 140;

/**
 * Feuille de feedback d'une étape notée (fiche §6.4) : verte si juste,
 * rouge sinon, avec l'explication et le bouton suivant. Elle glisse depuis le
 * bas et la pastille « +2 XP » apparaît en zoom, sauf si « Réduire les
 * animations » est activé (simple fondu court, puis rien).
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
  /** Texte court de la bonne réponse (seconde erreur) ; `null` quand elle est montrée dans l'étape. */
  answerLabel: string | null;
  xp: number;
  /** Question reposée en fin de leçon : elle ne revient pas une 3e fois. */
  again: boolean;
  /** Zone sûre du bas : la feuille colorée descend jusqu'au bord de l'écran. */
  bottomInset: number;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const good = phase === 'correct';
  const title =
    phase === 'correct'
      ? t('lesson.correctTitle')
      : phase === 'incorrect'
        ? t('lesson.incorrectTitle')
        : answerLabel
          ? t('lesson.revealedTitle', { answer: answerLabel })
          : t('lesson.revealedShownTitle');

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility([title, explanation].filter(Boolean).join('. '));
  }, [title, explanation]);

  const sheetIn = reduced
    ? FadeIn.duration(120).reduceMotion(ReduceMotion.System)
    : SlideInDown.duration(SHEET_MS).reduceMotion(ReduceMotion.System);
  const xpIn = reduced
    ? undefined
    : ZoomIn.delay(XP_DELAY_MS).springify().damping(12).reduceMotion(ReduceMotion.System);

  return (
    // className sur une View classique : NativeWind ne gère pas celle d'Animated.View.
    <Animated.View entering={sheetIn}>
      <View
        testID="feedback-panel"
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
            <Animated.View entering={xpIn}>
              {/* Bleu nuit sur or : contraste AA (l'ancien or sur or clair restait sous 4,5:1). */}
              <View testID="xp-gain" className="rounded-full bg-gold-400 px-3 py-1">
                <Text variant="label" className="font-body-bold text-blue-900">
                  {t('lesson.xpGain', { count: xp })}
                </Text>
              </View>
            </Animated.View>
          ) : null}
        </View>
        {explanation ? <Text variant="body">{explanation}</Text> : null}
        {phase === 'revealed' && !again ? <Text variant="meta">{t('lesson.revealedLater')}</Text> : null}
        <Button
          testID="feedback-cta"
          label={phase === 'incorrect' ? t('lesson.retry') : t('lesson.continue')}
          variant={good ? 'primary' : 'secondary'}
          onPress={onPress}
        />
      </View>
    </Animated.View>
  );
}
