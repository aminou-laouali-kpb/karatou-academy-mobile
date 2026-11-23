import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { colors } from '@/theme/tokens';

import type { PathNode as PathNodeModel } from '../path';

/** Décalage horizontal en zigzag (parcours Brilliant / Duolingo). */
const OFFSETS = [0, 44, 0, -44];
export const NODE_SIZE = 64;

const STYLE = {
  done: { bg: colors.gold[400], edge: colors.gold[700], icon: 'checkmark' as const, color: colors.white },
  current: { bg: colors.blue[500], edge: colors.blue[700], icon: 'play' as const, color: colors.white },
  available: { bg: colors.blue[500], edge: colors.blue[700], icon: 'play' as const, color: colors.white },
  locked: {
    bg: colors.gray[200],
    edge: colors.gray[300],
    icon: 'lock-closed' as const,
    color: colors.gray[500],
  },
};

/** Halo pulsé autour du nœud en cours (désactivé si « Réduire les animations »). */
function Halo() {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  useEffect(() => {
    if (!reduced) scale.value = withRepeat(withTiming(1.35, { duration: 1200 }), -1, true);
  }, [reduced, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: 1.6 - scale.value }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: NODE_SIZE,
          height: NODE_SIZE,
          borderRadius: NODE_SIZE / 2,
          backgroundColor: colors.blue[200],
        },
        style,
      ]}
    />
  );
}

export function PathNode({ node, onPress }: { node: PathNodeModel; onPress: () => void }) {
  const { t } = useTranslation();
  const s = STYLE[node.state];
  const offset = OFFSETS[node.index % OFFSETS.length] ?? 0;
  return (
    <View className="items-center" style={{ transform: [{ translateX: offset }] }}>
      {node.state === 'current' && (
        <View className="mb-2 rounded-md bg-blue-900 px-3 py-1.5">
          <Text variant="label" className="font-body-bold text-white">
            {t('module.start')}
          </Text>
        </View>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t('module.lessonNumber', { number: node.index + 1 })}, ${node.lesson.title}, ${t(`module.state.${node.state}`)}`}
        onPress={() => {
          void Haptics.selectionAsync();
          onPress();
        }}
        className="items-center justify-center"
        style={{ width: NODE_SIZE + 16, height: NODE_SIZE + 12 }}
      >
        {({ pressed }) => (
          <>
            {node.state === 'current' && <Halo />}
            <View
              style={{
                width: NODE_SIZE,
                height: NODE_SIZE,
                borderRadius: NODE_SIZE / 2,
                backgroundColor: s.bg,
                borderBottomWidth: pressed ? 0 : 5,
                borderBottomColor: s.edge,
                marginTop: pressed ? 5 : 0,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={s.icon} size={28} color={s.color} />
            </View>
          </>
        )}
      </Pressable>
      <Text variant="meta" className="mt-1 max-w-[180px] text-center text-gray-700" numberOfLines={2}>
        {node.lesson.title}
      </Text>
    </View>
  );
}

/** Nœud final « Certificat » (médaille), plein quand tout est fait. */
export function CertificateNode({ ready }: { ready: boolean }) {
  const { t } = useTranslation();
  return (
    <View
      className="items-center gap-1"
      accessible
      accessibilityLabel={`${t('module.certificate')}. ${ready ? t('module.certificateReady') : t('module.certificateHint')}`}
    >
      <View
        style={{
          width: NODE_SIZE + 8,
          height: NODE_SIZE + 8,
          borderRadius: (NODE_SIZE + 8) / 2,
          backgroundColor: ready ? colors.gold[400] : colors.gray[100],
          borderWidth: 3,
          borderColor: ready ? colors.gold[700] : colors.gray[300],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="ribbon" size={32} color={ready ? colors.white : colors.gray[400]} />
      </View>
      <Text variant="label" className="font-body-semibold">
        {t('module.certificate')}
      </Text>
      <Text variant="meta" className="text-center">
        {ready ? t('module.certificateReady') : t('module.certificateHint')}
      </Text>
    </View>
  );
}
