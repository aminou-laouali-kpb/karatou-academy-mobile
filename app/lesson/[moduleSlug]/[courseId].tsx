import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { Player, Shell } from '@/components/lesson/LessonPlayer';
import { Button, Text } from '@/components/ui';
import { useLessonBody } from '@/features/lesson/api';
import { isLanguage, type Language } from '@/i18n';
import { useIsOffline } from '@/lib/network';
import { colors } from '@/theme/tokens';

/** Lecteur immersif (E08) : une étape à la fois, « Vérifier » puis « Continuer ». */
export default function LessonPlayerScreen() {
  const { moduleSlug, courseId } = useLocalSearchParams<{ moduleSlug: string; courseId: string }>();
  const { t, i18n } = useTranslation();
  const lang: Language = isLanguage(i18n.language) ? i18n.language : 'fr';
  const offline = useIsOffline();
  const body = useLessonBody(courseId, lang);

  // Hors ligne sans cache, la requête est en pause : on l'affiche comme « hors ligne ».
  const paused = body.fetchStatus === 'paused';
  if (body.isPending && !paused) {
    return (
      <Shell onClose={() => router.back()}>
        <View accessibilityLabel={t('lesson.loading')} className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.blue[500]} />
        </View>
      </Shell>
    );
  }

  if (!body.data) {
    const state = paused || (body.isError && offline) ? 'offline' : body.isError ? 'error' : 'empty';
    return (
      <Shell onClose={() => router.back()}>
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Text variant="display" accessibilityElementsHidden importantForAccessibility="no">
            {state === 'empty' ? '🚧' : state === 'offline' ? '📴' : '⚠️'}
          </Text>
          <Text variant="h2" className="text-center">
            {t(`lesson.${state}Title`)}
          </Text>
          <Text variant="body" className="text-center text-gray-500">
            {t(`lesson.${state}Body`)}
          </Text>
          {state === 'error' && (
            <Button label={t('common.retry')} variant="secondary" onPress={() => void body.refetch()} />
          )}
        </View>
      </Shell>
    );
  }

  return (
    <Player
      moduleSlug={moduleSlug}
      courseId={courseId}
      lang={lang}
      body={body.data.body}
      bodyLang={body.data.bodyLang}
    />
  );
}
