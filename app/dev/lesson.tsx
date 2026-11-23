import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Player } from '@/components/lesson/LessonPlayer';
import { isLanguage } from '@/i18n';
import { parseLessonContent, type LessonContent } from '@/lesson-engine';

/**
 * Aperçu du lecteur (dev) avec une vraie leçon du registre web (module 1, leçon 1),
 * dans la langue de l'app. Rien n'est envoyé au serveur.
 */
export default function DevLessonScreen() {
  const { i18n } = useTranslation();
  // `?start=26` ouvre la leçon à l'étape 26 (QA rapide des dernières étapes).
  const { start } = useLocalSearchParams<{ start?: string }>();
  const startAt = Number(start) || 0;
  const lang = isLanguage(i18n.language) ? i18n.language : 'fr';
  // Chargé seulement en dev : le JSON (≈ 60 ko) ne part pas dans le build de production.
  const sample = __DEV__ ? (require('@/lesson-engine/samples/ia-c1.json') as Record<string, unknown>) : {};
  const body = parseLessonContent(sample[lang]) as LessonContent | null;
  if (!body) return null;
  return <Player
      moduleSlug="dev"
      courseId={`ia-c1@${startAt}`}
      lang={lang}
      body={body}
      bodyLang={lang}
      startAt={startAt}
      preview
    />;
}
