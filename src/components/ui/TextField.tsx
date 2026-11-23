import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState, type ComponentRef } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '@/theme/tokens';

import { cn } from './cn';
import { Text } from './Text';

export type TextFieldProps = TextInputProps & {
  label: string;
  hint?: string;
  /** Message d'erreur déjà traduit ; bordure rouge et annonce aux lecteurs d'écran. */
  error?: string | null;
  /** Champ mot de passe avec bouton afficher / masquer. */
  password?: boolean;
  className?: string;
};

/** Champ de saisie étiqueté (formulaires d'inscription, connexion, profil). */
export const TextField = forwardRef<ComponentRef<typeof TextInput>, TextFieldProps>(function TextField(
  { label, hint, error, password = false, className, ...props },
  ref,
) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View className={cn('gap-1.5', className)}>
      <Text variant="label" className="text-gray-700">
        {label}
      </Text>
      <View
        className={cn(
          'min-h-[52px] flex-row items-center rounded-md border-2 bg-white',
          error ? 'border-red-500' : focused ? 'border-blue-500' : 'border-gray-200',
        )}
      >
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          placeholderTextColor={colors.gray[400]}
          secureTextEntry={password && !visible}
          autoCapitalize={password ? 'none' : props.autoCapitalize}
          autoCorrect={password ? false : props.autoCorrect}
          maxFontSizeMultiplier={1.3}
          className="flex-1 px-4 py-3 font-body text-body text-gray-900"
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? t('auth.fields.hidePassword') : t('auth.fields.showPassword')}
            onPress={() => setVisible((v) => !v)}
            hitSlop={8}
            className="h-11 w-11 items-center justify-center"
          >
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.gray[500]} />
          </Pressable>
        )}
      </View>
      {error ? (
        <Text variant="meta" className="text-red-700" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="meta">{hint}</Text>
      ) : null}
    </View>
  );
});
