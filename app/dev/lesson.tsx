import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Player } from '@/components/lesson/LessonPlayer';
import { isLanguage } from '@/i18n';
import { parseLessonContent, type LessonContent, type Step, type StepType } from '@/lesson-engine';
import { SAMPLE_ORDER, SAMPLE_STEPS } from '@/lesson-engine/samples/steps';

/**
 * Aperçu du lecteur (dev) avec une vraie leçon du registre web (module 1, leçon 1),
 * dans la langue de l'app. Rien n'est envoyé au serveur.
 *
 * - `?start=26` ouvre la leçon à l'étape 26 (QA rapide des dernières étapes) ;
 * - `?steps=match` joue une seule étape factice de la galerie, `?steps=all` toutes.
 */
export default function DevLessonScreen() {
  const { i18n } = useTranslation();
  const { start, steps: only } = useLocalSearchParams<{ start?: string; steps?: string }>();
  const startAt = Number(start) || 0;
  const lang = isLanguage(i18n.language) ? i18n.language : 'fr';
  // Chargé seulement en dev : le JSON (≈ 60 ko) ne part pas dans le build de production.
  const sample = __DEV__ ? (require('@/lesson-engine/samples/ia-c1.json') as Record<string, unknown>) : {};
  const body = parseLessonContent(sample[lang]) as LessonContent | null;
  if (!body) return null;

  let steps: Step[] | undefined;
  if (only === 'all') steps = SAMPLE_ORDER.map((type) => SAMPLE_STEPS[type]);
  else if (only && only in SAMPLE_STEPS) steps = [SAMPLE_STEPS[only as StepType]];

  return (
    <Player
      moduleSlug="dev"
      courseId={steps ? `steps-${only}` : `ia-c1@${startAt}`}
      lang={lang}
      body={body}
      bodyLang={lang}
      steps={steps}
      startAt={startAt}
      preview
    />
  );
}
