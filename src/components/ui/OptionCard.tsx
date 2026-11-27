import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { cn } from './cn';
import { Text } from './Text';

export type OptionCardProps = {
  label: string;
  description?: string;
  /** Emoji ou icône à gauche. */
  leading?: ReactNode;
  /** Texte secondaire à droite (ex. « 30 XP »). */
  trailing?: string;
  selected: boolean;
  onPress: () => void;
  className?: string;
  testID?: string;
};

/**
 * Réponse à choix unique de l'onboarding (Brilliant) : grande carte,
 * bordure bleue et fond clair une fois choisie.
 */
export function OptionCard({
  label,
  description,
  leading,
  trailing,
  selected,
  onPress,
  className,
  testID,
}: OptionCardProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={[label, description, trailing].filter(Boolean).join(', ')}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      className={className}
    >
      {({ pressed }) => (
        <View
          className={cn(
            'min-h-[60px] flex-row items-center gap-3 rounded-lg border-2 border-b-4 px-4 py-3',
            selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white',
            pressed && 'bg-gray-50',
          )}
        >
          {leading ? <View className="w-8 items-center">{leading}</View> : null}
          <View className="flex-1 gap-0.5">
            <Text variant="h3" className={cn('font-body-semibold text-body', selected && 'text-blue-700')}>
              {label}
            </Text>
            {description ? <Text variant="meta">{description}</Text> : null}
          </View>
          {trailing ? (
            <Text variant="label" className={cn('text-gray-500', selected && 'text-blue-700')}>
              {trailing}
            </Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}
