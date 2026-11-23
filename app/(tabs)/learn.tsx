import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OfflineBanner } from '@/components/OfflineBanner';
import { Button, Card, Chip, Text } from '@/components/ui';
import { useCatalog, useProgress } from '@/features/catalog/api';
import { ModuleCard } from '@/features/catalog/components/ModuleCard';
import { buildPath, completedSet } from '@/features/catalog/path';
import { useIsOffline } from '@/lib/network';
import { colors } from '@/theme/tokens';

/** E05 Apprendre : chips de rubriques, puis cartes de modules. */
export default function LearnScreen() {
  const { t } = useTranslation();
  const catalog = useCatalog();
  const { data: progress = [] } = useProgress();
  const offline = useIsOffline();
  const [rubrique, setRubrique] = useState<string | null>(null);

  const modules = useMemo(() => {
    const all = catalog.data?.modules ?? [];
    return rubrique ? all.filter((m) => m.rubriqueId === rubrique) : all;
  }, [catalog.data, rubrique]);

  // Rubriques qui ont au moins un module publié.
  const rubriques = useMemo(() => {
    const used = new Set(catalog.data?.modules.map((m) => m.rubriqueId));
    return (catalog.data?.rubriques ?? []).filter((r) => used.has(r.id));
  }, [catalog.data]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="gap-3 px-5 pb-2 pt-4">
        <Text variant="h1">{t('catalog.title')}</Text>
        {rubriques.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 pr-5"
          >
            <Chip label={t('catalog.all')} selected={rubrique === null} onPress={() => setRubrique(null)} />
            {rubriques.map((r) => (
              <Chip
                key={r.id}
                label={`${r.icon} ${r.name}`}
                selected={rubrique === r.id}
                onPress={() => setRubrique(r.id)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {catalog.isPending ? (
        <View className="flex-1 items-center justify-center">
          {offline ? (
            <Text variant="body" className="px-8 text-center text-gray-500">
              {t('common.offlineEmpty')}
            </Text>
          ) : (
            <ActivityIndicator
              size="large"
              color={colors.blue[500]}
              accessibilityLabel={t('common.loading')}
            />
          )}
        </View>
      ) : catalog.isError && !catalog.data ? (
        <View className="flex-1 justify-center px-5">
          <Card className="gap-3">
            <Text variant="body">{t('common.error')}</Text>
            <Button variant="secondary" label={t('common.retry')} onPress={() => void catalog.refetch()} />
          </Card>
        </View>
      ) : (
        <FlatList
          data={modules}
          keyExtractor={(m) => m.id}
          contentContainerClassName="gap-4 px-5 pb-10 pt-2"
          ListHeaderComponent={<OfflineBanner />}
          ListEmptyComponent={
            <Text variant="body" className="pt-10 text-center text-gray-500">
              {t('catalog.empty')}
            </Text>
          }
          refreshing={catalog.isRefetching}
          onRefresh={() => void catalog.refetch()}
          renderItem={({ item }) => (
            <ModuleCard
              module={item}
              progress={buildPath(item, completedSet(progress, item.slug)).progress}
              onPress={() => router.push({ pathname: '/module/[slug]', params: { slug: item.slug } })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
