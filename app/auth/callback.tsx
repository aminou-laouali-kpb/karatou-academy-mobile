import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import type { AuthErrorKey } from '@/features/auth/authErrors';
import { mapAuthError } from '@/features/auth/authErrors';
import { parseAuthParams } from '@/features/auth/deepLink';
import { exchangeCode } from '@/features/auth/service';
import { useAuth } from '@/features/auth/store';
import { colors } from '@/theme/tokens';

/**
 * karatou://auth/callback?code=… : lien de confirmation d'e-mail ou retour OAuth.
 * Échange le code contre une session, puis ouvre l'accueil.
 */
export default function AuthCallbackScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<Record<string, string>>();
  // Le lien n'est lu qu'une fois, au montage.
  const [parsed] = useState(() => parseAuthParams(params));
  const [error, setError] = useState<AuthErrorKey | null>(() => {
    if (parsed.kind === 'error') return mapAuthError({ code: parsed.code, message: parsed.description });
    // Lien nu : seulement normal si le navigateur OAuth a déjà ouvert la session.
    if (parsed.kind === 'none' && useAuth.getState().status !== 'signedIn') return 'linkExpired';
    return null;
  });

  useEffect(() => {
    if (parsed.kind === 'none' && useAuth.getState().status === 'signedIn') router.replace('/home');
    if (parsed.kind !== 'code') return;
    void exchangeCode(parsed.code).then((result) => {
      if (result.ok) router.replace('/home');
      else setError(result.error);
    });
  }, [parsed]);

  return (
    <Screen
      footer={
        error ? (
          <Button label={t('auth.callback.toSignIn')} onPress={() => router.replace('/sign-in')} />
        ) : null
      }
    >
      <View className="items-center gap-4 pt-24" accessibilityLiveRegion="polite">
        {error ? (
          <>
            <Text variant="h2" className="text-center">
              {t('auth.callback.failed')}
            </Text>
            <Text variant="body" className="text-center text-gray-500">
              {t(`auth.errors.${error}`)}
            </Text>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color={colors.blue[500]} />
            <Text variant="body">{t('auth.callback.working')}</Text>
          </>
        )}
      </View>
    </Screen>
  );
}
