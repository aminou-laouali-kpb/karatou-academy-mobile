import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { Text } from '@/components/ui';
import { cn } from '@/components/ui/cn';
import type { Step } from '@/lesson-engine';
import { colors } from '@/theme/tokens';

type Of<T extends Step['type']> = Extract<Step, { type: T }>;

export function IntroStep({ step, number }: { step: Of<'intro'>; number?: number }) {
  const { t } = useTranslation();
  return (
    <View className="gap-6 pt-6">
      <View className="gap-3">
        {number ? <Text variant="eyebrow">{t('lesson.lessonNumber', { number })}</Text> : null}
        <Text variant="h1">{step.title}</Text>
        <View className="self-start rounded-full bg-blue-50 px-3 py-1">
          <Text variant="label" className="text-blue-700">
            ⏱ {t('lesson.minutes', { count: step.estMinutes })}
          </Text>
        </View>
      </View>
      {step.objective ? (
        <View className="gap-2 rounded-lg border-2 border-gray-200 bg-white p-4">
          <Text variant="eyebrow">🎯 {t('lesson.objective')}</Text>
          <Text variant="body-lg">{step.objective}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function ExplainStep({ step }: { step: Of<'explain'> }) {
  return (
    <View className="gap-4 pt-4">
      {step.title ? <Text variant="h2">{step.title}</Text> : null}
      <Text variant="body-lg" className="leading-[28px]">
        {step.body}
      </Text>
    </View>
  );
}

export function PredictRevealStep({ step, revealed }: { step: Of<'predict_reveal'>; revealed: boolean }) {
  const { t } = useTranslation();
  return (
    <View className="gap-4 pt-4">
      {step.title ? <Text variant="h2">{step.title}</Text> : null}
      <View className="gap-2 rounded-lg border-2 border-orange-500 bg-orange-50 p-4">
        <Text variant="eyebrow" className="text-orange-700">
          🧩 {t('lesson.challenge')}
        </Text>
        <Text variant="body-lg">{step.challenge}</Text>
      </View>
      {revealed ? (
        <>
          <View className="gap-2 rounded-lg border-2 border-emerald-500 bg-emerald-50 p-4">
            <Text variant="eyebrow" className="text-emerald-700">
              💡 {t('lesson.solution')}
            </Text>
            <Text variant="body-lg">{step.solution}</Text>
          </View>
          {step.impact ? (
            <View className="gap-2 rounded-lg border-2 border-gray-200 bg-white p-4">
              <Text variant="eyebrow">📈 {t('lesson.impact')}</Text>
              <Text variant="body">{step.impact}</Text>
            </View>
          ) : null}
        </>
      ) : (
        <Text variant="body" className="text-gray-500">
          {t('lesson.thinkFirst')}
        </Text>
      )}
    </View>
  );
}

export function ChecklistStep({
  step,
  checked,
  onToggle,
}: {
  step: Of<'checklist'>;
  checked: number[];
  onToggle: (index: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="gap-4 pt-4">
      <View className="gap-2">
        <Text variant="eyebrow">✍️ {t('lesson.practice')}</Text>
        {step.title ? <Text variant="h2">{step.title}</Text> : null}
      </View>
      <View className="gap-3">
        {step.items.map((item, index) => {
          const on = checked.includes(index);
          return (
            <Pressable
              key={index}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={item}
              onPress={() => {
                void Haptics.selectionAsync();
                onToggle(index);
              }}
              className={cn(
                'min-h-[56px] flex-row items-start gap-3 rounded-lg border-2 px-4 py-3',
                on ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white',
              )}
            >
              <Ionicons
                name={on ? 'checkbox' : 'square-outline'}
                size={24}
                color={on ? colors.emerald[500] : colors.gray[400]}
              />
              <Text variant="body" className="flex-1">
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {step.observation ? (
        <View className="gap-2 rounded-lg bg-blue-50 p-4">
          <Text variant="eyebrow" className="text-blue-700">
            👀 {t('lesson.observation')}
          </Text>
          <Text variant="body">{step.observation}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function ReflectionStep({
  step,
  value,
  onChange,
}: {
  step: Of<'reflection'>;
  value: string;
  onChange: (text: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="gap-4 pt-4">
      <Text variant="eyebrow">💭 {t('lesson.reflection')}</Text>
      {/* Les questions de réflexion sont souvent longues : texte courant, pas un titre. */}
      <Text variant="body-lg" className="font-body-semibold leading-[28px]">
        {step.prompt}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        multiline
        textAlignVertical="top"
        placeholder={t('lesson.reflectionPlaceholder')}
        placeholderTextColor={colors.gray[500]}
        accessibilityLabel={step.prompt}
        maxLength={2000}
        className="min-h-[140px] rounded-lg border-2 border-gray-200 bg-white p-4 font-body text-body text-gray-900"
      />
      <Text variant="meta">🔒 {t('lesson.reflectionPrivate')}</Text>
    </View>
  );
}

export function RecapStep({ step }: { step: Of<'recap'> }) {
  const { t } = useTranslation();
  return (
    <View className="gap-4 pt-4">
      <Text variant="h2">⭐ {t('lesson.recap')}</Text>
      <View className="gap-3">
        {step.points.map((point, index) => (
          <View key={index} className="flex-row items-start gap-3 rounded-lg bg-white p-4">
            <Ionicons name="checkmark-circle" size={22} color={colors.emerald[500]} />
            <Text variant="body-lg" className="flex-1">
              {point}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
