import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, useWindowDimensions, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

import { Text } from '@/components/ui';
import type { Language } from '@/i18n';
import { useIsOffline } from '@/lib/network';
import { colors } from '@/theme/tokens';

import { youtubeId } from '../localize';

/**
 * Vidéo d'introduction du module. Sobre en data (fiche §1.4) : rien n'est chargé
 * (ni lecteur ni miniature) tant que l'apprenant n'appuie pas, et pas d'autoplay.
 */
export function IntroVideo({
  url,
  videoLang,
  userLang,
}: {
  url: string;
  videoLang: Language;
  userLang: Language;
}) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const offline = useIsOffline();
  const id = youtubeId(url);
  if (!id) return null;
  const height = Math.round(((width - 40) * 9) / 16);

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text variant="eyebrow">{t('module.introVideo')}</Text>
        {videoLang !== userLang && (
          <View className="rounded-full bg-gray-100 px-2 py-0.5">
            <Text variant="meta">{t('module.videoLang', { language: t(`language.${videoLang}`) })}</Text>
          </View>
        )}
      </View>
      {open ? (
        <View className="overflow-hidden rounded-lg bg-black" style={{ height }}>
          <YoutubePlayer
            height={height}
            videoId={id}
            play
            initialPlayerParams={{ rel: false, modestbranding: true }}
          />
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('module.playVideo')}
          accessibilityState={{ disabled: offline }}
          disabled={offline}
          onPress={() => setOpen(true)}
          className="items-center justify-center gap-2 rounded-lg bg-blue-900 px-6"
          style={{ height }}
        >
          <View className="h-16 w-16 items-center justify-center rounded-full bg-white/15">
            <Ionicons name={offline ? 'cloud-offline-outline' : 'play'} size={34} color={colors.white} />
          </View>
          <Text variant="meta" className="text-center text-blue-100">
            {offline ? t('common.offline') : t('module.videoData')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
