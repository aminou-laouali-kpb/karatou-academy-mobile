import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';

import { colors } from '@/theme/tokens';

import { cn } from './cn';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'ghost' | 'ghostInverse';

const variants: Record<ButtonVariant, { face: string; edge: string; text: string; spinner: string }> = {
  primary: { face: 'bg-blue-500', edge: 'border-blue-700', text: 'text-white', spinner: colors.white },
  secondary: {
    face: 'bg-white border-2 border-gray-200',
    edge: 'border-gray-200',
    text: 'text-blue-700',
    spinner: colors.blue[500],
  },
  gold: { face: 'bg-gold-400', edge: 'border-gold-700', text: 'text-blue-900', spinner: colors.blue[900] },
  ghost: {
    face: 'bg-transparent',
    edge: 'border-transparent',
    text: 'text-blue-500',
    spinner: colors.blue[500],
  },
  /** Bouton texte sur fond sombre (dégradé « dark ») : blanc pour garder le contraste AA. */
  ghostInverse: {
    face: 'bg-transparent',
    edge: 'border-transparent',
    text: 'text-white',
    spinner: colors.white,
  },
};

export type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  /** Retour haptique léger à l'appui (désactivable). */
  haptic?: boolean;
  className?: string;
};

/**
 * Bouton « 3D » (Brilliant / Duolingo, fiche §10.3) : hauteur 52, rayon 16,
 * bordure basse de 4 px plus foncée, qui s'enfonce à l'appui.
 */
export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  icon,
  fullWidth = true,
  haptic = true,
  onPress,
  className,
  ...props
}: ButtonProps) {
  const v = variants[variant];
  const isDisabled = disabled || loading;
  const isGhost = variant === 'ghost' || variant === 'ghostInverse';
  const has3d = !isGhost;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={(e) => {
        if (haptic) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
      }}
      className={cn(fullWidth ? 'self-stretch' : 'self-start', className)}
      {...props}
    >
      {({ pressed }) => {
        const down = pressed && !isDisabled;
        return (
          <View
            className={cn(
              'rounded-lg',
              has3d && v.edge,
              has3d && (down ? 'mt-1 border-b-0' : 'border-b-4'),
              isDisabled && 'opacity-50',
            )}
          >
            <View
              className={cn(
                // Les boutons texte (ghost) peuvent passer sur 2 lignes : leurs libellés
                // sont des phrases (« Pas encore de compte ? … »), parfois longues en hausa.
                isGhost ? 'min-h-[52px] py-2' : 'h-[52px]',
                'flex-row items-center justify-center gap-2 rounded-lg px-6',
                v.face,
                variant === 'ghost' && down && 'bg-blue-50',
                variant === 'ghostInverse' && down && 'bg-white/10',
              )}
            >
              {loading ? (
                <ActivityIndicator color={v.spinner} />
              ) : (
                <>
                  {icon}
                  <Text
                    variant="h3"
                    className={cn('font-body-bold', isGhost && 'text-center', v.text)}
                    numberOfLines={isGhost ? 2 : 1}
                  >
                    {label}
                  </Text>
                </>
              )}
            </View>
          </View>
        );
      }}
    </Pressable>
  );
}
