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

import { posthog } from '@/lib/analytics';
import { queryClient, queryPersister } from '@/lib/queryClient';
import { initSentry, Sentry } from '@/lib/sentry';
import { appFonts } from '@/theme/fonts';

initSentry();
void SplashScreen.preventAutoHideAsync();

function Analytics({ children }: { children: ReactNode }) {
  if (!posthog) return <>{children}</>;
  return (
    <PostHogProvider client={posthog} autocapture={{ captureScreens: false, captureTouches: false }}>
      {children}
    </PostHogProvider>
  );
}

function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(appFonts);

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: queryPersister }}>
          <Analytics>
            <BottomSheetModalProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false }} />
            </BottomSheetModalProvider>
          </Analytics>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
