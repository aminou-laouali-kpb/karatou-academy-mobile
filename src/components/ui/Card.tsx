import type { ReactNode } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';

import { cn } from './cn';

export type CardProps = ViewProps & {
  children: ReactNode;
  /** Rend la carte appuyable. Fournir alors accessibilityLabel. */
  onPress?: () => void;
  className?: string;
};

export function Card({ children, onPress, className, ...props }: CardProps) {
  const base = cn('rounded-lg border border-gray-200 bg-white p-4', className);
  if (!onPress) {
    return (
      <View className={base} {...props}>
        {children}
      </View>
    );
  }
  return (
    <Pressable accessibilityRole="button" onPress={onPress} {...props}>
      {({ pressed }) => <View className={cn(base, pressed && 'bg-gray-50')}>{children}</View>}
    </Pressable>
  );
}
