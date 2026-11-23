import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';

/** Lecteur immersif (E08) : écran d'attente jusqu'au sprint S4. */
export default function LessonPlayerPlaceholder() {
  const { t } = useTranslation();
  return (
    <Screen footer={<Button label={t('common.close')} variant="secondary" onPress={() => router.back()} />}>
      <View className="items-center gap-3 pt-24">
        <Text variant="display" accessibilityElementsHidden importantForAccessibility="no">
          🚧
        </Text>
        <Text variant="h2" className="text-center">
          {t('lesson.soonTitle')}
        </Text>
        <Text variant="body" className="text-center text-gray-500">
          {t('lesson.soonBody')}
        </Text>
      </View>
    </Screen>
  );
}
