import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Text } from '@/components/ui';
import { useProfile } from '@/features/profile/api';

/** E04 Accueil, version S2 : salutation. Carte « Continuer » au sprint S3. */
export default function HomeScreen() {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const firstName = profile?.full_name?.split(' ')[0];
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="gap-6 px-5 pt-4">
        <Text variant="h1">
          {firstName ? t('home.greeting', { name: firstName }) : t('home.greetingNoName')}
        </Text>
        <Card className="gap-2">
          <Text variant="h3">{t('home.soonTitle')}</Text>
          <Text variant="body" className="text-gray-500">
            {t('home.soonBody')}
          </Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}
