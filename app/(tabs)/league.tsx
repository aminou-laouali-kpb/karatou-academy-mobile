import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';

/** Onglet prévu par la fiche §4, rempli à un sprint suivant. */
export default function LeagueScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="flex-1 items-center justify-center gap-2 px-5">
        <Text variant="h2">{t('tabs.league')}</Text>
        <Text variant="body" className="text-gray-500">
          {t('placeholder.soon')}
        </Text>
      </View>
    </SafeAreaView>
  );
}
