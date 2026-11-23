import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Sheet, Text } from '@/components/ui';
import { DownloadButton } from '@/features/downloads/components/DownloadButton';
import { isLanguage } from '@/i18n';

import { useLessonVideoLanguage } from '../api';
import type { PathNode } from '../path';
import type { Module } from '../types';

/** XP de base d'une leçon terminée la 1ʳᵉ fois (fiche §7.1), accordée par le serveur. */
export const LESSON_BASE_XP = 20;

/**
 * E07 Feuille leçon : titre, durée, XP à gagner, langue de la vidéo, « Commencer »,
 * et « Télécharger le module » pour le mode avion (E17).
 */
export const LessonSheet = forwardRef<
  BottomSheetModal,
  { node: PathNode | null; module?: Module; onStart: (node: PathNode) => void }
>(function LessonSheet({ node, module, onStart }, ref) {
  const { t, i18n } = useTranslation();
  const lang = isLanguage(i18n.language) ? i18n.language : 'fr';
  const { data: videoLang } = useLessonVideoLanguage(node && node.state !== 'locked' ? node.lesson.id : null);

  return (
    <Sheet ref={ref}>
      {node && (
        <>
          <View className="gap-1">
            <Text variant="eyebrow">{t('module.lessonNumber', { number: node.index + 1 })}</Text>
            <Text variant="h2">{node.lesson.title}</Text>
            {node.lesson.description ? (
              <Text variant="body" className="text-gray-500">
                {node.lesson.description}
              </Text>
            ) : null}
          </View>
          <View className="flex-row flex-wrap gap-2">
            <Pill text={`⏱ ${node.lesson.duration}`} />
            {node.state === 'done' ? (
              <Pill text={`✓ ${t('lessonSheet.done')}`} tone="gold" />
            ) : (
              <Pill text={`⭐ ${t('lessonSheet.xp', { count: LESSON_BASE_XP })}`} tone="gold" />
            )}
            {videoLang && (
              <Pill
                text={`▶ ${t('module.videoLang', { language: t(`language.${videoLang}`) })}`}
                tone={videoLang === lang ? 'default' : 'muted'}
              />
            )}
          </View>
          {node.state === 'locked' ? (
            <Text variant="body" className="text-gray-700">
              🔒 {t('lessonSheet.locked')}
            </Text>
          ) : (
            <Button
              label={node.state === 'done' ? t('lessonSheet.replay') : t('lessonSheet.start')}
              variant={node.state === 'done' ? 'secondary' : 'primary'}
              onPress={() => onStart(node)}
            />
          )}
          {module ? <DownloadButton module={module} /> : null}
        </>
      )}
    </Sheet>
  );
});

function Pill({ text, tone = 'default' }: { text: string; tone?: 'default' | 'gold' | 'muted' }) {
  const bg = tone === 'gold' ? 'bg-gold-50' : tone === 'muted' ? 'bg-gray-100' : 'bg-blue-50';
  return (
    <View className={`rounded-full px-3 py-1 ${bg}`}>
      <Text variant="label" className="text-gray-900">
        {text}
      </Text>
    </View>
  );
}
