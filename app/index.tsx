import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button, Text } from '@/components/ui';
import { gradients } from '@/theme/tokens';

/**
 * Écran de bienvenue provisoire (S1). Remplacé par l'onboarding E01 au sprint S2.
 */
export default function Welcome() {
  const { t } = useTranslation();
  return (
    <LinearGradient colors={gradients.dark} style={{ flex: 1 }}>
      {/* Fond sombre : icônes de la barre d'état en clair. */}
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 justify-between px-6 py-8">
          <LanguageSwitcher />

          <View className="items-center gap-6">
            <View className="h-24 w-24 items-center justify-center rounded-xl bg-gold-400" accessible={false}>
              <Text variant="display" className="text-blue-900">
                K
              </Text>
            </View>
            <Text variant="h1" className="text-center text-white">
              {t('welcome.title')}
            </Text>
            <Text variant="body-lg" className="text-center text-blue-100">
              {t('welcome.promise')}
            </Text>
          </View>

          <View className="gap-3">
            <Button label={t('welcome.start')} variant="gold" onPress={() => {}} />
            <Button label={t('welcome.haveAccount')} variant="ghostInverse" onPress={() => {}} />
            {__DEV__ && (
              <Button label={t('welcome.devGallery')} variant="secondary" onPress={() => router.push('/dev/ui')} />
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
