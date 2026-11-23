import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { Button, Screen, Text, TextField } from '@/components/ui';
import type { AuthErrorKey } from '@/features/auth/authErrors';
import { mapAuthError } from '@/features/auth/authErrors';
import { FormError } from '@/features/auth/components';
import { parseAuthParams } from '@/features/auth/deepLink';
import { exchangeCode, updatePassword } from '@/features/auth/service';
import { useAuth } from '@/features/auth/store';
import { MIN_PASSWORD_LENGTH, validateNewPassword, type FieldError } from '@/features/auth/validation';
import { colors } from '@/theme/tokens';

/**
 * karatou://reset-password?code=… : ouvre une session de récupération,
 * puis l'apprenant choisit un nouveau mot de passe.
 */
export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<Record<string, string>>();
  const signedIn = useAuth((s) => s.status === 'signedIn');
  // Le lien n'est lu qu'une fois, au montage.
  const [parsed] = useState(() => parseAuthParams(params));
  const [checking, setChecking] = useState(parsed.kind === 'code');
  const [linkError, setLinkError] = useState<AuthErrorKey | null>(() =>
    parsed.kind === 'error' ? mapAuthError({ code: parsed.code, message: parsed.description }) : null,
  );
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldError, setFieldError] = useState<FieldError | null>(null);
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (parsed.kind === 'error') return;
    useAuth.getState().setRecovering(true);
    if (parsed.kind !== 'code') return;
    void exchangeCode(parsed.code).then((result) => {
      if (!result.ok) setLinkError(result.error);
      setChecking(false);
    });
  }, [parsed]);

  const submit = async () => {
    const invalid = validateNewPassword(password, confirm);
    setFieldError(invalid);
    if (invalid) return;
    setError(null);
    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);
    if (result.ok) router.replace('/home');
    else setError(result.error);
  };

  const leave = () => {
    useAuth.getState().setRecovering(false);
    router.replace('/forgot-password');
  };

  if (checking) {
    return (
      <Screen>
        <View className="items-center pt-24">
          <ActivityIndicator size="large" color={colors.blue[500]} />
        </View>
      </Screen>
    );
  }

  if (linkError || !signedIn) {
    return (
      <Screen footer={<Button label={t('auth.forgot.submit')} onPress={leave} />}>
        <View className="gap-3 pt-16">
          <Text variant="h1">{t('auth.reset.title')}</Text>
          <FormError error={linkError ?? 'linkExpired'} />
        </View>
      </Screen>
    );
  }

  const fieldMsg = fieldError ? t(`auth.errors.${fieldError}`, { count: MIN_PASSWORD_LENGTH }) : null;

  return (
    <Screen
      footer={<Button label={t('auth.reset.submit')} loading={loading} onPress={() => void submit()} />}
    >
      <Text variant="h1">{t('auth.reset.title')}</Text>
      <View className="gap-4">
        <TextField
          label={t('auth.fields.newPassword')}
          hint={t('auth.fields.passwordHint', { count: MIN_PASSWORD_LENGTH })}
          value={password}
          onChangeText={setPassword}
          error={fieldError === 'passwordTooShort' ? fieldMsg : null}
          password
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <TextField
          label={t('auth.fields.confirmPassword')}
          value={confirm}
          onChangeText={setConfirm}
          error={fieldError === 'passwordsDiffer' ? fieldMsg : null}
          password
          autoComplete="new-password"
          textContentType="newPassword"
        />
      </View>
      <FormError error={error} />
    </Screen>
  );
}
