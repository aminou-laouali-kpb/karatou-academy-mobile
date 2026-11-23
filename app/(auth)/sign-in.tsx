import { Link, router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Screen, Text, TextField } from '@/components/ui';
import type { AuthErrorKey } from '@/features/auth/authErrors';
import { FormError, SocialButtons } from '@/features/auth/components';
import { signInWithEmail } from '@/features/auth/service';
import { validateEmail } from '@/features/auth/validation';

/** E03 Connexion : e-mail + mot de passe, Google, Apple. */
export default function SignInScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const invalid = validateEmail(email);
    setEmailError(invalid ? t(`auth.errors.${invalid}`) : null);
    if (invalid || !password) return;
    setError(null);
    setLoading(true);
    const result = await signInWithEmail(email, password);
    setLoading(false);
    if (result.ok) router.replace('/home');
    else setError(result.error);
  };

  return (
    <Screen back>
      <View className="gap-2">
        <Text variant="h1">{t('auth.signIn.title')}</Text>
        <Text variant="body" className="text-gray-500">
          {t('auth.signIn.subtitle')}
        </Text>
      </View>

      <SocialButtons onError={setError} />

      <View className="gap-4">
        <TextField
          label={t('auth.fields.email')}
          value={email}
          onChangeText={setEmail}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
        />
        <TextField
          label={t('auth.fields.password')}
          value={password}
          onChangeText={setPassword}
          password
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={() => void submit()}
        />
        <Link href="/forgot-password" asChild>
          <Button variant="ghost" fullWidth={false} label={t('auth.signIn.forgot')} />
        </Link>
      </View>

      <FormError error={error} />
      <Button label={t('auth.signIn.submit')} loading={loading} onPress={() => void submit()} />
      <Link href="/sign-up" replace asChild>
        <Button variant="ghost" label={t('auth.signIn.noAccount')} />
      </Link>
    </Screen>
  );
}
