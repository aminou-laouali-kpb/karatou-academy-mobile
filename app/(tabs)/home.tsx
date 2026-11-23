import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OfflineBanner } from '@/components/OfflineBanner';
import { Button, Card, ProgressBar, Text } from '@/components/ui';
import { useCatalog, useProgress } from '@/features/catalog/api';
import { continueTarget, type ContinueTarget } from '@/features/catalog/path';
import { useProfile } from '@/features/profile/api';
import { useIsOffline } from '@/lib/network';
import { moduleGradient } from '@/theme/moduleGradients';
import { colors } from '@/theme/tokens';

/**
 * E04 Accueil, version v0 (S3) : une seule action principale, « Continuer ».
 * Série, XP, objectif du jour et quêtes arrivent au sprint S6.
 */
export default function HomeScreen() {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const catalog = useCatalog();
  const progress = useProgress();
  const offline = useIsOffline();
  const firstName = profile?.full_name?.split(' ')[0];
  const target = catalog.data ? continueTarget(catalog.data.modules, progress.data ?? []) : null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView contentContainerClassName="gap-6 px-5 pb-10 pt-4">
        <Text variant="h1">
          {firstName ? t('home.greeting', { name: firstName }) : t('home.greetingNoName')}
        </Text>
        <OfflineBanner />

        {catalog.isPending ? (
          offline ? (
            <Text variant="body" className="text-gray-500">
              {t('common.offlineEmpty')}
            </Text>
          ) : (
            <ActivityIndicator color={colors.blue[500]} accessibilityLabel={t('common.loading')} />
          )
        ) : catalog.isError && !catalog.data ? (
          <Card className="gap-3">
            <Text variant="body">{t('common.error')}</Text>
            <Button variant="secondary" label={t('common.retry')} onPress={() => void catalog.refetch()} />
          </Card>
        ) : target ? (
          <ContinueCard target={target} />
        ) : (
          <Card>
            <Text variant="body">{t('home.allDone')}</Text>
          </Card>
        )}

        <Button variant="secondary" label={t('home.explore')} onPress={() => router.push('/learn')} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ContinueCard({ target }: { target: ContinueTarget }) {
  const { t } = useTranslation();
  const open = () => router.push({ pathname: '/module/[slug]', params: { slug: target.module.slug } });
  return (
    <View className="gap-2">
      <Text variant="eyebrow">{target.started ? t('home.continueTitle') : t('home.startTitle')}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${target.module.title}, ${target.lesson.title}`}
        onPress={open}
        className="overflow-hidden rounded-lg border border-gray-200 bg-white"
      >
        <LinearGradient
          colors={moduleGradient(target.module.color)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 16 }}
        >
          <View className="flex-row items-center gap-3">
            <Text
              style={{ fontSize: 36, lineHeight: 44 }}
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
              {target.module.emoji}
            </Text>
            <View className="flex-1">
              <Text variant="label" className="text-white/90">
                {target.module.title}
              </Text>
              <Text variant="h3" className="text-white">
                {target.lesson.title}
              </Text>
            </View>
          </View>
        </LinearGradient>
        <View className="gap-3 p-4">
          <View className="gap-1">
            <ProgressBar value={target.doneCount / target.total} />
            <Text variant="meta">
              {t('home.lessonOf', { current: target.doneCount + 1, total: target.total })}
            </Text>
          </View>
          <Button label={t('home.continue')} onPress={open} />
        </View>
      </Pressable>
    </View>
  );
}
