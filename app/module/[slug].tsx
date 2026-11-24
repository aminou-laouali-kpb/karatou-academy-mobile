import { Ionicons } from '@expo/vector-icons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OfflineBanner } from '@/components/OfflineBanner';
import { Button, ProgressBar, Screen, Text } from '@/components/ui';
import { useCatalog, useProgress } from '@/features/catalog/api';
import { IntroVideo } from '@/features/catalog/components/IntroVideo';
import { LessonSheet } from '@/features/catalog/components/LessonSheet';
import { CertificateNode, PathNode } from '@/features/catalog/components/PathNode';
import { introVideoFor } from '@/features/catalog/localize';
import { buildPath, completedSet, type PathNode as PathNodeModel } from '@/features/catalog/path';
import { isLanguage } from '@/i18n';
import { moduleGradient } from '@/theme/moduleGradients';
import { colors } from '@/theme/tokens';

/** E06 Parcours du module : en-tête, vidéo d'intro, nœuds en zigzag, certificat. */
export default function ModuleScreen() {
  const { t, i18n } = useTranslation();
  const lang = isLanguage(i18n.language) ? i18n.language : 'fr';
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const catalog = useCatalog();
  const { data: progress = [] } = useProgress();
  const sheet = useRef<BottomSheetModal>(null);
  const [selected, setSelected] = useState<PathNodeModel | null>(null);

  const module = catalog.data?.modules.find((m) => m.slug === slug);
  const path = useMemo(
    () => (module ? buildPath(module, completedSet(progress, module.slug)) : null),
    [module, progress],
  );

  if (catalog.isPending) {
    return (
      <Screen back>
        <ActivityIndicator size="large" color={colors.blue[500]} accessibilityLabel={t('common.loading')} />
      </Screen>
    );
  }
  if (!module || !path) {
    return (
      <Screen back footer={<Button label={t('common.retry')} onPress={() => void catalog.refetch()} />}>
        <Text variant="body">{catalog.isError ? t('common.error') : t('module.notFound')}</Text>
      </Screen>
    );
  }

  const video = introVideoFor(module, lang);
  const percent = Math.round(path.progress * 100);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <LinearGradient
          colors={moduleGradient(module.color)}
          style={{ paddingTop: insets.top + 4, paddingBottom: 24 }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/learn'))}
            className="ml-2 h-11 w-11 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={26} color={colors.white} />
          </Pressable>
          <View className="gap-2 px-5">
            <Text
              style={{ fontSize: 44, lineHeight: 52 }}
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
              {module.emoji}
            </Text>
            <Text variant="h1" className="text-white">
              {module.title}
            </Text>
            {module.subtitle ? (
              <Text variant="body" className="text-white/90">
                {module.subtitle}
              </Text>
            ) : null}
            <View className="gap-1 pt-2">
              <ProgressBar value={path.progress} tone="gold" className="bg-white/25" />
              <Text variant="meta" className="text-white">
                {path.completed
                  ? t('catalog.completed')
                  : `${t('catalog.progress', { percent })} · ${t('catalog.lessons', { count: module.lessons.length })}`}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View className="gap-6 px-5 pt-5">
          <OfflineBanner />
          {video && <IntroVideo url={video.url} videoLang={video.lang} userLang={lang} />}
          <Text variant="eyebrow">{t('module.path')}</Text>
          <View className="items-center gap-5">
            {path.nodes.map((node) => (
              <PathNode
                key={node.lesson.id}
                node={node}
                onPress={() => {
                  setSelected(node);
                  sheet.current?.present();
                }}
              />
            ))}
            <CertificateNode ready={path.completed} />
          </View>
        </View>
      </ScrollView>

      <LessonSheet
        ref={sheet}
        node={selected}
        module={module}
        onStart={(node) => {
          sheet.current?.dismiss();
          router.push({
            pathname: '/lesson/[moduleSlug]/[courseId]',
            params: { moduleSlug: module.slug, courseId: node.lesson.id },
          });
        }}
      />
    </View>
  );
}
