import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, ProgressBar, Screen, Text } from '@/components/ui';
import { type AttemptResult, badgeName, questType, xpRows } from '@/features/lesson/attemptResult';
import { usePendingItems } from '@/features/lesson/queue';
import { useLessonStore } from '@/features/lesson/store';

/**
 * Fin de leçon (E09). Tant que la tentative n'est pas synchronisée, on montre
 * l'estimation locale de l'XP ; dès que le serveur a répondu, ses chiffres
 * officiels la remplacent : XP crédité (quêtes comprises), niveau, série,
 * objectif du jour, quêtes et nouveaux badges. Un quiz sous 70 % n'est pas
 * validé : pas d'XP, on invite à réessayer.
 */
export default function LessonCompleteScreen() {
  const { t, i18n } = useTranslation();
  const summary = useLessonStore((s) => s.lastSummary);
  const lastResult = useLessonStore((s) => s.lastResult);
  const result = lastResult && lastResult.attemptId === summary?.attemptId ? lastResult.result : null;
  const pending = usePendingItems().some((item) => item.id === summary?.attemptId);

  const passed = summary?.quizPassed !== false;
  useEffect(() => {
    void Haptics.notificationAsync(
      passed ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
    );
  }, [passed]);

  const leave = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  if (!summary) {
    return (
      <Screen footer={<Button label={t('lessonComplete.continue')} onPress={leave} />}>
        <View />
      </Screen>
    );
  }

  const { xp } = summary;
  const minutes = Math.max(1, Math.round(summary.durationMs / 60000));
  const rows = [
    { label: t('lessonComplete.xpLesson'), value: xp.completion },
    { label: t('lessonComplete.xpSteps'), value: xp.steps },
    { label: t('lessonComplete.xpPerfect'), value: xp.perfect },
  ].filter((row) => row.value > 0);

  return (
    <Screen footer={<Button testID="lesson-complete-continue" label={t('lessonComplete.continue')} onPress={leave} />}>
      <View className="items-center gap-2 pt-10" testID={passed ? 'lesson-complete-passed' : 'lesson-complete-failed'}>
        <Text variant="display" accessibilityElementsHidden importantForAccessibility="no">
          {passed ? '🎉' : '💪'}
        </Text>
        <Text variant="h1" className="text-center">
          {t(passed ? 'lessonComplete.title' : 'lessonComplete.notPassedTitle')}
        </Text>
        <Text variant="body" className="text-center text-gray-500">
          {summary.title}
        </Text>
      </View>

      {passed ? null : (
        <Text variant="body" className="text-center">
          {t('lessonComplete.notPassedBody')}
        </Text>
      )}

      {passed && result ? <OfficialXp result={result} /> : null}
      {passed && !result ? (
        <View className="gap-3 rounded-lg border-2 border-gold-400 bg-gold-50 p-4">
          <Text variant="h1" className="text-center text-gold-700">
            {t('lessonComplete.xpTotal', { count: xp.total })}
          </Text>
          {rows.map((row) => (
            <View key={row.label} className="flex-row justify-between">
              <Text variant="body">{row.label}</Text>
              <Text variant="label">+{row.value}</Text>
            </View>
          ))}
          {!summary.firstCompletion ? <Text variant="meta">{t('lessonComplete.replay')}</Text> : null}
          <Text variant="meta">{t('lessonComplete.estimate')}</Text>
        </View>
      ) : null}

      {passed && result?.moduleCompleted ? (
        <View className="rounded-md bg-emerald-50 px-3 py-2">
          <Text variant="label" className="text-emerald-700">
            🏁 {t('lessonComplete.moduleCompleted')}
          </Text>
        </View>
      ) : null}

      {passed && result ? <Progress result={result} lang={i18n.language} /> : null}

      <View className="flex-row gap-3">
        <Stat label={t('lessonComplete.accuracy')} value={`${Math.round(summary.accuracy * 100)} %`} />
        <Stat label={t('lessonComplete.duration')} value={t('lessonComplete.minutes', { count: minutes })} />
      </View>

      {summary.sent ? (
        <View
          accessibilityLiveRegion="polite"
          className={pending ? 'rounded-md bg-orange-50 px-3 py-2' : 'rounded-md bg-emerald-50 px-3 py-2'}
        >
          <Text variant="label" className={pending ? 'text-orange-700' : 'text-emerald-700'}>
            {pending
              ? `⏳ ${t('lessonComplete.pending')}`
              : `✓ ${t(passed ? 'lessonComplete.synced' : 'lessonComplete.attemptSynced')}`}
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}

const XP_ROW_LABEL = {
  lesson: 'lessonComplete.xpLesson',
  bonus: 'lessonComplete.xpBonus',
  quests: 'lessonComplete.xpQuests',
  other: 'lessonComplete.xpOther',
} as const;

/** XP réellement crédité par le serveur, détaillé par motif. */
function OfficialXp({ result }: { result: AttemptResult }) {
  const { t } = useTranslation();
  return (
    <View className="gap-3 rounded-lg border-2 border-gold-400 bg-gold-50 p-4" accessibilityLiveRegion="polite">
      <Text variant="h1" className="text-center text-gold-700">
        {t('lessonComplete.xpTotal', { count: result.xpGained })}
      </Text>
      {xpRows(result.xpBreakdown).map((row) => (
        <View key={row.key} className="flex-row justify-between">
          <Text variant="body">{t(XP_ROW_LABEL[row.key])}</Text>
          <Text variant="label">+{row.amount}</Text>
        </View>
      ))}
      {result.levelUp ? (
        <Text variant="label" className="text-center text-gold-700">
          ⬆️ {t('lessonComplete.levelUp', { level: result.level })}
        </Text>
      ) : null}
      <Text variant="meta">
        {t('lessonComplete.official')} · {t('lessonComplete.totalXp', { xp: result.totalXp, level: result.level })}
      </Text>
    </View>
  );
}

/** Série, objectif du jour, quêtes et badges, d'après la réponse du serveur. */
function Progress({ result, lang }: { result: AttemptResult; lang: string }) {
  const { t } = useTranslation();
  const goal = result.dailyGoal;
  return (
    <View className="gap-4 rounded-lg border-2 border-gray-200 bg-white p-4">
      {result.streak.current > 0 ? (
        <View className="gap-1">
          <Text variant="h2">🔥 {t('lessonComplete.streak', { count: result.streak.current })}</Text>
          {result.streakExtended ? <Text variant="meta">{t('lessonComplete.streakExtended')}</Text> : null}
        </View>
      ) : null}

      {goal && goal.target > 0 ? (
        <View className="gap-2">
          <Text variant="label">
            {goal.reached
              ? `🎯 ${t('lessonComplete.dailyGoalReached')}`
              : t('lessonComplete.dailyGoal', { earned: goal.earned, target: goal.target })}
          </Text>
          <ProgressBar
            value={goal.earned / goal.target}
            tone="gold"
            accessibilityLabel={t('lessonComplete.dailyGoal', { earned: goal.earned, target: goal.target })}
          />
        </View>
      ) : null}

      {result.quests.length > 0 ? (
        <View className="gap-2">
          <Text variant="eyebrow">{t('lessonComplete.questsTitle')}</Text>
          {result.quests.map((quest) => (
            <View key={quest.key} className="flex-row items-center justify-between gap-3">
              <Text variant="body" className={quest.completed ? 'flex-1 text-emerald-700' : 'flex-1'}>
                {quest.completed ? '✓ ' : ''}
                {t(`lessonComplete.quests.${questType(quest.key)}`, { count: quest.target })}
              </Text>
              <Text variant="meta">
                {Math.min(quest.progress, quest.target)}/{quest.target}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {result.newBadges.length > 0 ? (
        <View className="gap-2">
          <Text variant="eyebrow">{t('lessonComplete.newBadges', { count: result.newBadges.length })}</Text>
          {result.newBadges.map((badge) => (
            <Text key={badge.key} variant="label">
              🏅 {badgeName(badge, lang)}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center gap-1 rounded-lg border-2 border-gray-200 bg-white p-4">
      <Text variant="eyebrow">{label}</Text>
      <Text variant="h2">{value}</Text>
    </View>
  );
}
