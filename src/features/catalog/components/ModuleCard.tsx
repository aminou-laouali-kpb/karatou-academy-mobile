import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { ProgressBar, Text } from '@/components/ui';
import { moduleGradient } from '@/theme/moduleGradients';

import { levelKey } from '../localize';
import type { Module } from '../types';

/** Carte module (E05) : dégradé + emoji, durée, nombre de leçons, niveau, progression. */
export function ModuleCard({
  module,
  progress,
  onPress,
}: {
  module: Module;
  progress: number;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const level = levelKey(module.level);
  const percent = Math.round(progress * 100);
  const meta = [
    module.duration,
    t('catalog.lessons', { count: module.lessons.length }),
    level ? t(`catalog.levels.${level}`) : module.level,
  ].join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${module.title}. ${meta}. ${progress >= 1 ? t('catalog.completed') : t('catalog.progress', { percent })}`}
      onPress={onPress}
    >
      {({ pressed }) => (
        <View
          className={`overflow-hidden rounded-lg border border-gray-200 bg-white ${pressed ? 'opacity-90' : ''}`}
        >
          <LinearGradient
            colors={moduleGradient(module.color)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ height: 88, paddingHorizontal: 16, justifyContent: 'center' }}
          >
            <View className="flex-row items-center justify-between">
              <Text
                style={{ fontSize: 40, lineHeight: 48 }}
                accessibilityElementsHidden
                importantForAccessibility="no"
              >
                {module.emoji}
              </Text>
              <View className="rounded-full bg-white/90 px-3 py-1">
                <Text variant="meta" className="font-body-semibold text-blue-900">
                  🎓 {t('catalog.certifying')}
                </Text>
              </View>
            </View>
          </LinearGradient>
          <View className="gap-2 p-4">
            <Text variant="h3">{module.title}</Text>
            {module.subtitle ? (
              <Text variant="body" className="text-gray-500" numberOfLines={2}>
                {module.subtitle}
              </Text>
            ) : null}
            <Text variant="meta">{meta}</Text>
            {progress > 0 && (
              <View className="gap-1 pt-1">
                <ProgressBar value={progress} tone={progress >= 1 ? 'gold' : 'blue'} />
                <Text variant="meta">
                  {progress >= 1 ? t('catalog.completed') : t('catalog.progress', { percent })}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}
