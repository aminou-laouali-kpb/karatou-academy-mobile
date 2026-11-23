import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { DAILY_GOALS } from '@/features/onboarding/options';
import { useOnboarding } from '@/features/onboarding/store';

/** Fin de l'onboarding : récapitulatif du plan, puis inscription. */
export default function PlanScreen() {
  const { t } = useTranslation();
  const answers = useOnboarding((s) => s.answers);
  const complete = useOnboarding((s) => s.complete);
  const goal = DAILY_GOALS.find((g) => g.xp === answers.dailyGoalXp) ?? DAILY_GOALS[0];

  const rows = [
    {
      emoji: '🎯',
      title: t('onboarding.plan.daily', { minutes: goal.minutes }),
      body: t('onboarding.plan.dailyHint', { goal: t(`onboarding.dailyGoal.${goal.key}`), xp: goal.xp }),
    },
    {
      emoji: '⏰',
      title: answers.reminderTime
        ? t('onboarding.plan.reminder', { time: answers.reminderTime })
        : t('onboarding.plan.noReminder'),
    },
    { emoji: '🌱', title: t('onboarding.plan.start'), body: t('onboarding.plan.startHint') },
    { emoji: '📶', title: t('onboarding.plan.offline') },
  ];

  return (
    <Screen
      back
      footer={
        <Button
          label={t('onboarding.plan.cta')}
          onPress={() => {
            complete();
            router.push('/sign-up');
          }}
        />
      }
    >
      <View className="gap-2">
        <Text variant="eyebrow">{t('onboarding.plan.eyebrow')}</Text>
        <Text variant="h1">{t('onboarding.plan.title')}</Text>
      </View>
      <Card className="gap-4">
        {rows.map((row) => (
          <View key={row.title} className="flex-row gap-3" accessible>
            <Text variant="h2" accessibilityElementsHidden importantForAccessibility="no">
              {row.emoji}
            </Text>
            <View className="flex-1 gap-0.5">
              <Text variant="h3">{row.title}</Text>
              {row.body ? <Text variant="meta">{row.body}</Text> : null}
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
