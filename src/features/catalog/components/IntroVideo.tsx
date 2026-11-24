import { Ionicons } from '@expo/vector-icons';
import { useNetInfo } from '@react-native-community/netinfo';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, useWindowDimensions, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

import { Text } from '@/components/ui';
import { videoAccess } from '@/features/downloads/logic';
import { useDownloads } from '@/features/downloads/store';
import type { Language } from '@/i18n';
import { useIsOffline } from '@/lib/network';
import { colors } from '@/theme/tokens';

import { youtubeId } from '../localize';

/**
 * Vidéo d'introduction du module. Sobre en data (fiche §1.4) : rien n'est chargé
 * (ni lecteur ni miniature) tant que l'apprenant n'appuie pas, et pas d'autoplay.
 * Avec le réglage « Vidéos en Wi-Fi uniquement », rien ne se lance sur les données mobiles.
 */
export function IntroVideo({
  url,
  videoLang,
  userLang,
  label,
}: {
  url: string;
  videoLang: Language;
  userLang: Language;
  /** Titre au-dessus du lecteur ; « Vidéo d'introduction » par défaut. */
  label?: string;
}) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const offline = useIsOffline();
  const wifiOnly = useDownloads((s) => s.videosWifiOnly);
  const { type: connectionType } = useNetInfo();
  const access = videoAccess({ offline, wifiOnly, connectionType });
  const id = youtubeId(url);
  if (!id) return null;
  const height = Math.round(((width - 40) * 9) / 16);

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text variant="eyebrow">{label ?? t('module.introVideo')}</Text>
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
          accessibilityHint={access === 'wifiOnly' ? t('downloads.videoBlocked') : undefined}
          accessibilityState={{ disabled: access !== 'ok' }}
          disabled={access !== 'ok'}
          onPress={() => setOpen(true)}
          className="items-center justify-center gap-2 rounded-lg bg-blue-900 px-6"
          style={{ height }}
        >
          <View className="h-16 w-16 items-center justify-center rounded-full bg-white/15">
            <Ionicons
              name={access === 'offline' ? 'cloud-offline-outline' : access === 'wifiOnly' ? 'wifi' : 'play'}
              size={34}
              color={colors.white}
            />
          </View>
          <Text variant="meta" className="text-center text-blue-100">
            {access === 'offline'
              ? t('common.offline')
              : access === 'wifiOnly'
                ? t('downloads.videoBlocked')
                : t('module.videoData')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
