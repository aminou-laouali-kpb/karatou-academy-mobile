import '../global.css';
import '@/i18n';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { PostHogProvider } from 'posthog-react-native';
import { useEffect, type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { startAuthListener, useAuth } from '@/features/auth/store';
import { startOfflineQueue } from '@/features/lesson/queue';
import { useSyncPreferredLanguage } from '@/features/profile/api';
import { posthog } from '@/lib/analytics';
import '@/lib/network';
import { PERSIST_MAX_AGE, queryClient, queryPersister } from '@/lib/queryClient';
import { initSentry, Sentry } from '@/lib/sentry';
import { appFonts } from '@/theme/fonts';

initSentry();
void SplashScreen.preventAutoHideAsync();
startAuthListener();
startOfflineQueue();

function Analytics({ children }: { children: ReactNode }) {
  if (!posthog) return <>{children}</>;
  return (
    <PostHogProvider client={posthog} autocapture={{ captureScreens: false, captureTouches: false }}>
      {children}
    </PostHogProvider>
  );
}

/**
 * Routes selon la session : onboarding et auth pour les visiteurs,
 * onglets et réglages pour les apprenants connectés. Les liens de retour
 * (confirmation d'e-mail, OAuth, mot de passe) restent accessibles à tous.
 */
function RootStack() {
  const signedIn = useAuth((s) => s.status === 'signedIn');
  const recovering = useAuth((s) => s.recovering);
  useSyncPreferredLanguage();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && !recovering}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="module/[slug]" />
        <Stack.Screen
          name="lesson/[moduleSlug]/[courseId]"
          options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
        />
        <Stack.Screen name="lesson-complete" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
      </Stack.Protected>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/callback" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="dev/ui" />
      <Stack.Screen name="dev/lesson" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
    </Stack>
  );
}

function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(appFonts);
  const authLoading = useAuth((s) => s.status === 'loading');
  const ready = (fontsLoaded || Boolean(fontError)) && !authLoading;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: queryPersister, maxAge: PERSIST_MAX_AGE, buster: 'v1' }}
        >
          <Analytics>
            <BottomSheetModalProvider>
              <StatusBar style="dark" />
              <RootStack />
            </BottomSheetModalProvider>
          </Analytics>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
