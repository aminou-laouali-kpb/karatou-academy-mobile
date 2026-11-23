import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, Switch, View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { useCatalog } from '@/features/catalog/api';
import { useModuleDownload, useRemoveDownload } from '@/features/downloads/hooks';
import { formatSize } from '@/features/downloads/logic';
import { cachedLessonCount } from '@/features/downloads/service';
import { useDownloads, type DownloadedModule } from '@/features/downloads/store';
import { useIsOffline } from '@/lib/network';
import { colors } from '@/theme/tokens';

/** E17 Téléchargements : modules disponibles hors ligne, taille, suppression ; réglage vidéo. */
export default function DownloadsScreen() {
  const { t, i18n } = useTranslation();
  const modules = useDownloads((s) => s.modules);
  const wifiOnly = useDownloads((s) => s.videosWifiOnly);
  const setWifiOnly = useDownloads((s) => s.setVideosWifiOnly);
  const list = Object.values(modules).sort((a, b) => b.downloadedAt - a.downloadedAt);
  const units = { kb: t('downloads.kb'), mb: t('downloads.mb') };
  const total = list.reduce((sum, m) => sum + m.bytes, 0);

  return (
    <Screen back>
      <Text variant="h1">{t('downloads.title')}</Text>

      <View className="gap-2">
        <Text variant="eyebrow">{t('downloads.settings')}</Text>
        <Card className="min-h-[64px] flex-row items-center gap-3">
          <View className="flex-1 gap-1">
            <Text variant="label">{t('downloads.wifiOnly')}</Text>
            <Text variant="meta">{t('downloads.wifiOnlyHint')}</Text>
          </View>
          <Switch
            testID="wifi-only"
            accessibilityLabel={t('downloads.wifiOnly')}
            accessibilityHint={t('downloads.wifiOnlyHint')}
            value={wifiOnly}
            onValueChange={setWifiOnly}
            trackColor={{ true: colors.blue[500], false: colors.gray[300] }}
          />
        </Card>
      </View>

      <View className="gap-3">
        <View className="flex-row items-baseline justify-between gap-2">
          <Text variant="eyebrow">{t('downloads.modules')}</Text>
          {list.length > 0 ? (
            <Text variant="meta">
              {t('downloads.total', { size: formatSize(total, i18n.language, units) })}
            </Text>
          ) : null}
        </View>
        {list.length === 0 ? (
          <Card className="items-center gap-2 py-8">
            <Ionicons name="cloud-download-outline" size={40} color={colors.gray[400]} />
            <Text variant="h3" className="text-center">
              {t('downloads.emptyTitle')}
            </Text>
            <Text variant="body" className="text-center text-gray-600">
              {t('downloads.emptyBody')}
            </Text>
          </Card>
        ) : (
          list.map((entry) => <DownloadRow key={entry.slug} entry={entry} />)
        )}
      </View>
    </Screen>
  );
}

function DownloadRow({ entry }: { entry: DownloadedModule }) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const offline = useIsOffline();
  const remove = useRemoveDownload();
  const catalog = useCatalog();
  const module = catalog.data?.modules.find((m) => m.slug === entry.slug);
  const { state, start } = useModuleDownload(module);
  const cached = cachedLessonCount(queryClient, entry);
  const incomplete = cached < entry.lessonIds.length && state.status !== 'downloading';
  const units = { kb: t('downloads.kb'), mb: t('downloads.mb') };
  const date = new Date(entry.downloadedAt).toLocaleDateString(i18n.language, {
    day: 'numeric',
    month: 'long',
  });

  const confirm = () =>
    Alert.alert(t('downloads.deleteTitle'), t('downloads.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('downloads.delete'), style: 'destructive', onPress: () => remove(entry.slug) },
    ]);

  return (
    <Card testID={`download-${entry.slug}`} className="gap-3">
      <View className="flex-row items-center gap-3">
        <Text variant="h2" accessibilityElementsHidden importantForAccessibility="no">
          {entry.emoji}
        </Text>
        <View className="flex-1 gap-0.5">
          <Text variant="label">{entry.title}</Text>
          <Text variant="meta">
            {t('catalog.lessons', { count: entry.lessonIds.length })} ·{' '}
            {t('downloads.size', { size: formatSize(entry.bytes, i18n.language, units) })}
          </Text>
          <Text variant="meta">{t('downloads.downloadedOn', { date })}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('downloads.deleteLabel', { title: entry.title })}
          onPress={confirm}
          className="h-11 w-11 items-center justify-center rounded-md active:bg-red-50"
        >
          <Ionicons name="trash-outline" size={22} color={colors.red[700]} />
        </Pressable>
      </View>
      {incomplete ? (
        <View className="gap-2">
          <Text variant="meta" className="text-orange-700">
            {t('downloads.incomplete')}
          </Text>
          {module ? (
            <Button
              label={t('downloads.redownload')}
              variant="secondary"
              disabled={offline}
              onPress={() => void start()}
            />
          ) : null}
        </View>
      ) : null}
      {state.status === 'downloading' ? (
        <Text variant="meta">
          {t('downloads.downloading', { done: state.progress.done, total: state.progress.total })}
        </Text>
      ) : null}
    </Card>
  );
}
