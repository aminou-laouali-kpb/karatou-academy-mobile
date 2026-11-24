import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, ProgressBar, Text } from '@/components/ui';
import type { Module } from '@/features/catalog/types';
import { useIsOffline } from '@/lib/network';
import { colors } from '@/theme/tokens';

import { useModuleDownload } from '../hooks';

/**
 * « Télécharger le module » de la feuille leçon (E07) : récupère les leçons du
 * module dans les 3 langues pour le mode avion. Jamais lancé sans appui.
 */
export function DownloadButton({ module }: { module: Pick<Module, 'slug' | 'title' | 'emoji' | 'lessons'> }) {
  const { t } = useTranslation();
  const offline = useIsOffline();
  const { state, start } = useModuleDownload(module);

  if (state.status === 'done') {
    return (
      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <Ionicons name="cloud-done" size={20} color={colors.emerald[700]} />
          <Text variant="label" className="flex-1 text-emerald-700">
            {t('downloads.downloaded')}
          </Text>
        </View>
        <Button label={t('downloads.manage')} variant="ghost" onPress={() => router.push('/downloads')} />
      </View>
    );
  }

  if (state.status === 'downloading') {
    const { done, total } = state.progress;
    const label = t('downloads.downloading', { done, total });
    return (
      <View className="gap-2" accessibilityLiveRegion="polite">
        <Text variant="label">{label}</Text>
        <ProgressBar value={total ? done / total : 0} accessibilityLabel={label} />
      </View>
    );
  }

  return (
    <View className="gap-2">
      <Button
        label={t('downloads.download')}
        variant="secondary"
        disabled={offline}
        icon={<Ionicons name="download-outline" size={20} color={colors.blue[700]} />}
        onPress={() => void start()}
      />
      <Text variant="meta" className={state.status === 'error' ? 'text-red-700' : undefined}>
        {offline
          ? t('downloads.offline')
          : state.status === 'error'
            ? t('downloads.error')
            : t('downloads.downloadHint', { count: module.lessons.length })}
      </Text>
    </View>
  );
}
