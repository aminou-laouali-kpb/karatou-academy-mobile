import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Text } from '@/components/ui';
import { isGraded } from '@/lesson-engine';
import { SAMPLE_ORDER, SAMPLE_STEPS } from '@/lesson-engine/samples/steps';
import { colors } from '@/theme/tokens';

/**
 * Galerie des étapes (fiche §6.5, QA visuelle, dev uniquement) : chaque type
 * d'étape avec des données factices, joué dans le vrai lecteur (feedback,
 * seconde chance, question reposée, animations).
 */
export default function StepsGallery() {
  const { t } = useTranslation();
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <Stack.Screen
        options={{ headerShown: true, title: t('dev.steps'), headerBackButtonDisplayMode: 'minimal' }}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerClassName="gap-4 p-5 pb-16">
        <Text variant="body" className="text-gray-600">
          {t('dev.stepsIntro')}
        </Text>
        <Button label={t('dev.playAll')} onPress={() => router.push('/dev/lesson?steps=all')} />
        <View className="gap-2">
          {SAMPLE_ORDER.map((type) => {
            const graded = isGraded(SAMPLE_STEPS[type]);
            return (
              <Pressable
                key={type}
                testID={`gallery-${type}`}
                accessibilityRole="button"
                accessibilityLabel={t(`dev.stepType.${type}`)}
                onPress={() => router.push(`/dev/lesson?steps=${type}`)}
                className="min-h-[56px] flex-row items-center gap-3 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 active:bg-gray-50"
              >
                <Ionicons
                  name={graded ? 'help-circle-outline' : 'book-outline'}
                  size={22}
                  color={graded ? colors.blue[500] : colors.gray[500]}
                />
                <View className="flex-1">
                  <Text variant="label">{t(`dev.stepType.${type}`)}</Text>
                  <Text variant="mono" className="text-meta text-gray-500">
                    {type}
                  </Text>
                </View>
                <Ionicons name="play" size={18} color={colors.gray[500]} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
