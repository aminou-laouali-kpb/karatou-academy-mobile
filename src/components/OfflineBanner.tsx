import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/components/ui';
import { useIsOffline } from '@/lib/network';
import { colors } from '@/theme/tokens';

/** Bandeau discret affiché hors ligne quand l'écran montre du contenu enregistré. */
export function OfflineBanner() {
  const { t } = useTranslation();
  const offline = useIsOffline();
  if (!offline) return null;
  return (
    <View
      className="flex-row items-center gap-2 rounded-md bg-gray-100 px-3 py-2"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Ionicons name="cloud-offline-outline" size={18} color={colors.gray[700]} />
      <Text variant="meta" className="flex-1 text-gray-700">
        {t('common.offlineCached')}
      </Text>
    </View>
  );
}
