import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, OptionCard, Screen, SegmentedProgressBar, Text } from '@/components/ui';
import {
  DAILY_GOALS,
  GOALS,
  isQuestionStep,
  LEVELS,
  MOMENTS,
  nextStep,
  QUESTION_STEPS,
  REMINDER_TIMES,
  suggestedReminder,
  type QuestionStep,
} from '@/features/onboarding/options';
import { useOnboarding } from '@/features/onboarding/store';
import { setLanguage, SUPPORTED_LANGUAGES, type Language } from '@/i18n';

/** Code de langue plutôt qu'un drapeau : le hausa se parle au Niger comme au Nigeria. */
function LanguageBadge({ lang }: { lang: Language }) {
  return (
    <View className="h-8 w-10 items-center justify-center rounded-sm bg-blue-900">
      <Text variant="label" className="font-body-bold text-white">
        {lang.toUpperCase()}
      </Text>
    </View>
  );
}

const GOAL_EMOJI = { career: '💼', studies: '🎓', business: '🏪', daily: '📱', curiosity: '✨' } as const;
const LEVEL_EMOJI = { beginner: '🌱', basics: '🌿', confident: '🌳' } as const;
const MOMENT_EMOJI = { morning: '🌅', midday: '☀️', evening: '🌇', night: '🌙' } as const;

/** E02 : une question par écran, barre de progression en haut. */
export default function QuestionScreen() {
  const { step } = useLocalSearchParams<{ step: string }>();
  if (!isQuestionStep(step)) return <Redirect href="/welcome" />;
  return <Question step={step} />;
}

function Question({ step }: { step: QuestionStep }) {
  const { t, i18n } = useTranslation();
  const answers = useOnboarding((s) => s.answers);
  const setAnswer = useOnboarding((s) => s.setAnswer);
  const index = QUESTION_STEPS.indexOf(step);

  const answered =
    step === 'language' ||
    (step === 'goal' && answers.goal !== undefined) ||
    (step === 'level' && answers.level !== undefined) ||
    (step === 'moment' && answers.moment !== undefined) ||
    (step === 'dailyGoal' && answers.dailyGoalXp !== undefined) ||
    (step === 'reminder' && answers.reminderTime !== undefined);

  const goNext = () => {
    const next = nextStep(step);
    if (next === 'plan') router.push('/plan');
    else router.push({ pathname: '/question/[step]', params: { step: next } });
  };

  // Le rappel est pré-rempli selon le moment choisi.
  useEffect(() => {
    if (step === 'reminder' && answers.reminderTime === undefined) {
      setAnswer('reminderTime', suggestedReminder(answers.moment));
    }
  }, [step, answers.reminderTime, answers.moment, setAnswer]);

  return (
    <Screen
      back
      header={
        <SegmentedProgressBar
          total={QUESTION_STEPS.length}
          completed={index + 1}
          accessibilityLabel={t('common.stepOf', { current: index + 1, total: QUESTION_STEPS.length })}
        />
      }
      footer={<Button testID="question-continue" label={t('common.continue')} disabled={!answered} onPress={goNext} />}
    >
      <View className="gap-2">
        <Text variant="h1">{t(`onboarding.${step}.title`)}</Text>
        {step === 'language' && (
          <Text variant="body" className="text-gray-500">
            {t('onboarding.language.hint')}
          </Text>
        )}
        {step === 'dailyGoal' && (
          <Text variant="body" className="text-gray-500">
            {t('onboarding.dailyGoal.hint')}
          </Text>
        )}
        {step === 'reminder' && (
          <Text variant="body" className="text-gray-500">
            {t('onboarding.reminder.hint')}
          </Text>
        )}
      </View>

      <View accessibilityRole="radiogroup" className="gap-3">
        {step === 'language' &&
          SUPPORTED_LANGUAGES.map((lang) => (
            <OptionCard
              key={lang}
              testID={`option-${lang}`}
              label={t(`language.${lang}`)}
              leading={<LanguageBadge lang={lang} />}
              selected={i18n.language === lang}
              onPress={() => void setLanguage(lang)}
            />
          ))}

        {step === 'goal' &&
          GOALS.map((goal) => (
            <OptionCard
              key={goal}
              testID={`option-${goal}`}
              label={t(`onboarding.goal.${goal}`)}
              leading={<Text variant="h2">{GOAL_EMOJI[goal]}</Text>}
              selected={answers.goal === goal}
              onPress={() => setAnswer('goal', goal)}
            />
          ))}

        {step === 'level' &&
          LEVELS.map((level) => (
            <OptionCard
              key={level}
              testID={`option-${level}`}
              label={t(`onboarding.level.${level}`)}
              description={t(`onboarding.level.${level}Hint`)}
              leading={<Text variant="h2">{LEVEL_EMOJI[level]}</Text>}
              selected={answers.level === level}
              onPress={() => setAnswer('level', level)}
            />
          ))}

        {step === 'moment' && (
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {MOMENTS.map((moment) => (
              <OptionCard
                key={moment}
                testID={`option-${moment}`}
                className="w-[48.5%]"
                label={t(`onboarding.moment.${moment}`)}
                leading={<Text variant="h2">{MOMENT_EMOJI[moment]}</Text>}
                selected={answers.moment === moment}
                onPress={() => setAnswer('moment', moment)}
              />
            ))}
          </View>
        )}

        {step === 'dailyGoal' &&
          DAILY_GOALS.map((goal) => (
            <OptionCard
              key={goal.key}
              testID={`option-${goal.key}`}
              label={t(`onboarding.dailyGoal.${goal.key}`)}
              description={t('onboarding.dailyGoal.detail', { minutes: goal.minutes, xp: goal.xp })}
              selected={answers.dailyGoalXp === goal.xp}
              onPress={() => setAnswer('dailyGoalXp', goal.xp)}
            />
          ))}

        {step === 'reminder' && (
          <>
            {REMINDER_TIMES.map((time) => (
              <OptionCard
                key={time}
                testID={`option-${time}`}
                label={t('onboarding.reminder.at', { time })}
                leading={<Text variant="h2">⏰</Text>}
                selected={answers.reminderTime === time}
                onPress={() => setAnswer('reminderTime', time)}
              />
            ))}
            <OptionCard
              testID="option-none"
              label={t('onboarding.reminder.none')}
              leading={<Text variant="h2">🔕</Text>}
              selected={answers.reminderTime === null}
              onPress={() => setAnswer('reminderTime', null)}
            />
          </>
        )}
      </View>
    </Screen>
  );
}
