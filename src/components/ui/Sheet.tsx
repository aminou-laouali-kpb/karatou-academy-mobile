import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, type ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from 'react-native-reanimated';

import { colors } from '@/theme/tokens';

import { cn } from './cn';

export type SheetTone = 'default' | 'success' | 'error';

const toneBg: Record<SheetTone, string> = {
  default: colors.white,
  success: colors.emerald[50],
  error: colors.red[50],
};

export type SheetProps = {
  children: ReactNode;
  tone?: SheetTone;
  onDismiss?: () => void;
  /** Fermeture par glissement ou appui sur le fond (désactivé pour le feedback). */
  dismissible?: boolean;
  className?: string;
};

/**
 * Feuille du bas (feuille leçon, feedback juste/faux).
 * S'ouvre avec ref.current?.present(), se ferme avec ref.current?.dismiss().
 */
export const Sheet = forwardRef<BottomSheetModal, SheetProps>(function Sheet(
  { children, tone = 'default', onDismiss, dismissible = true, className },
  ref,
) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={dismissible ? 'close' : 'none'}
      />
    ),
    [dismissible],
  );

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      enablePanDownToClose={dismissible}
      onDismiss={onDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: toneBg[tone], borderRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: colors.gray[300] }}
      animateOnMount={!reducedMotion}
      accessible={false}
    >
      <BottomSheetView style={{ paddingBottom: insets.bottom + 16 }}>
        <View className={cn('gap-4 px-5 pt-2', className)}>{children}</View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
