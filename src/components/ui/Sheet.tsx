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
  /**
   * Hauteurs fixes (ex. ['75%']) pour une feuille qui contient une liste
   * défilante (BottomSheetFlatList). Sans elles, la feuille prend la hauteur
   * de son contenu.
   */
  snapPoints?: (string | number)[];
  className?: string;
};

/**
 * Feuille du bas (feuille leçon, feedback juste/faux).
 * S'ouvre avec ref.current?.present(), se ferme avec ref.current?.dismiss().
 */
export const Sheet = forwardRef<BottomSheetModal, SheetProps>(function Sheet(
  { children, tone = 'default', onDismiss, dismissible = true, snapPoints, className },
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
      enableDynamicSizing={!snapPoints}
      snapPoints={snapPoints}
      topInset={insets.top}
      enablePanDownToClose={dismissible}
      onDismiss={onDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: toneBg[tone], borderRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: colors.gray[300] }}
      animateOnMount={!reducedMotion}
      accessible={false}
    >
      {snapPoints ? (
        <View style={{ flex: 1, paddingBottom: insets.bottom }} className={cn('gap-4 px-5 pt-2', className)}>
          {children}
        </View>
      ) : (
        <BottomSheetView style={{ paddingBottom: insets.bottom + 16 }}>
          <View className={cn('gap-4 px-5 pt-2', className)}>{children}</View>
        </BottomSheetView>
      )}
    </BottomSheetModal>
  );
});
