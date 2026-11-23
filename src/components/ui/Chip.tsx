import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { cn } from './cn';
import { Text } from './Text';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
  className?: string;
};

/** Pastille de filtre (rubriques, langues). Hauteur ≥ 44 pt pour le toucher. */
export function Chip({ label, selected = false, onPress, icon, className }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      hitSlop={4}
      className={cn('min-h-[44px] justify-center', className)}
    >
      {({ pressed }) => (
        <View
          className={cn(
            'h-9 flex-row items-center gap-1.5 rounded-full border px-4',
            selected ? 'border-blue-500 bg-blue-500' : 'border-gray-200 bg-white',
            pressed && !selected && 'bg-gray-100',
          )}
        >
          {icon}
          <Text variant="label" className={selected ? 'text-white' : 'text-gray-700'}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
