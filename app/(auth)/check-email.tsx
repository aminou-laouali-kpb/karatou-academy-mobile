import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';

/** Après l'inscription : la confirmation d'e-mail est active (décision web du 2026-09-11). */
export default function CheckEmailScreen() {
  const { t } = useTranslation();
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  return (
    <Screen
      footer={<Button label={t('auth.checkEmail.toSignIn')} onPress={() => router.replace('/sign-in')} />}
    >
      <View className="items-center gap-4 pt-16">
        <Text variant="display" accessibilityElementsHidden importantForAccessibility="no">
          📬
        </Text>
        <Text variant="h1" className="text-center">
          {t('auth.checkEmail.title')}
        </Text>
        <Text variant="body-lg" className="text-center text-gray-700">
          {t('auth.checkEmail.body', { email })}
        </Text>
        <Text variant="body" className="text-center text-gray-500">
          {t('auth.checkEmail.spam')}
        </Text>
      </View>
    </Screen>
  );
}
