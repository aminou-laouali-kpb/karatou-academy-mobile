import { Image } from 'expo-image';
import { View } from 'react-native';

import { cn } from './cn';
import { Text } from './Text';

export type AvatarProps = {
  name: string;
  uri?: string | null;
  size?: number;
  /** Anneau coloré (ex. : ma ligne dans un classement). */
  ring?: 'none' | 'blue' | 'gold';
  className?: string;
};

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

const ringClass = { none: '', blue: 'border-2 border-blue-500', gold: 'border-2 border-gold-400' };

export function Avatar({ name, uri, size = 44, ring = 'none', className }: AvatarProps) {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={name}
      className={cn('items-center justify-center overflow-hidden rounded-full bg-blue-100', ringClass[ring], className)}
      style={{ width: size, height: size }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} contentFit="cover" transition={150} />
      ) : (
        <Text
          variant="label"
          className="font-body-bold text-blue-700"
          style={{ fontSize: Math.round(size * 0.38), lineHeight: Math.round(size * 0.5) }}
        >
          {initialsOf(name)}
        </Text>
      )}
    </View>
  );
}
