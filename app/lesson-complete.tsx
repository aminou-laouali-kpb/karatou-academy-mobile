import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { usePendingItems } from '@/features/lesson/queue';
import { useLessonStore } from '@/features/lesson/store';

/**
 * Fin de leçon (E09), version locale de S4 : XP estimé, précision, durée et
 * état de la synchronisation. Série, quêtes et badges arrivent en S6.
 */
export default function LessonCompleteScreen() {
  const { t } = useTranslation();
  const summary = useLessonStore((s) => s.lastSummary);
  const pending = usePendingItems().some((item) => item.id === summary?.attemptId);

  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

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
    <Screen footer={<Button label={t('lessonComplete.continue')} onPress={leave} />}>
      <View className="items-center gap-2 pt-10">
        <Text variant="display" accessibilityElementsHidden importantForAccessibility="no">
          🎉
        </Text>
        <Text variant="h1" className="text-center">
          {t('lessonComplete.title')}
        </Text>
        <Text variant="body" className="text-center text-gray-500">
          {summary.title}
        </Text>
      </View>

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
            {pending ? `⏳ ${t('lessonComplete.pending')}` : `✓ ${t('lessonComplete.synced')}`}
          </Text>
        </View>
      ) : null}
    </Screen>
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
