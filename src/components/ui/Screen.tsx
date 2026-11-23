import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { colors } from '@/theme/tokens';

import { cn } from './cn';

export type ScreenProps = {
  children: ReactNode;
  /** Zone fixe en bas (bouton principal), au-dessus du clavier. */
  footer?: ReactNode;
  /** Affiche un bouton retour en haut à gauche. */
  back?: boolean;
  /** Élément à droite du bouton retour (ex. barre de progression). */
  header?: ReactNode;
  scroll?: boolean;
  className?: string;
};

/** Gabarit d'écran simple : marges, zone sûre, clavier, bouton principal collé en bas. */
export function Screen({ children, footer, back = false, header, scroll = true, className }: ScreenProps) {
  const { t } = useTranslation();
  const body = <View className={cn('gap-6 px-5 pb-6 pt-2', className)}>{children}</View>;
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {(back || header) && (
          <View className="min-h-[52px] flex-row items-center gap-2 px-3">
            {back && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('common.back')}
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
                className="h-11 w-11 items-center justify-center"
              >
                <Ionicons name="chevron-back" size={26} color={colors.gray[700]} />
              </Pressable>
            )}
            <View className="flex-1">{header}</View>
          </View>
        )}
        {scroll ? (
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="flex-grow">
            {body}
          </ScrollView>
        ) : (
          <View className="flex-1">{body}</View>
        )}
        {footer ? <View className="gap-3 px-5 pb-2 pt-3">{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
