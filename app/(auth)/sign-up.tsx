import { Link, router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Screen, Text, TextField } from '@/components/ui';
import type { AuthErrorKey } from '@/features/auth/authErrors';
import { CountryPicker, FormError, GenderPicker, SocialButtons } from '@/features/auth/components';
import { signUpWithEmail } from '@/features/auth/service';
import {
  MIN_PASSWORD_LENGTH,
  validateSignUp,
  type FieldError,
  type Gender,
} from '@/features/auth/validation';

/**
 * E03 Inscription : nom complet, e-mail, mot de passe, pays, genre facultatif.
 * Mêmes métadonnées que le web, pour que le trigger crée le profil.
 */
export default function SignUpScreen() {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [gender, setGender] = useState<Gender | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, FieldError>>>({});
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const [loading, setLoading] = useState(false);

  const msg = (key?: FieldError) => (key ? t(`auth.errors.${key}`, { count: MIN_PASSWORD_LENGTH }) : null);

  const submit = async () => {
    const errors = validateSignUp({ fullName, email, password, country, gender });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setError(null);
    setLoading(true);
    const result = await signUpWithEmail({ fullName, email, password, country, gender });
    setLoading(false);
    if (!result.ok) return setError(result.error);
    if (result.pendingEmailConfirmation) router.replace({ pathname: '/check-email', params: { email } });
    else router.replace('/home');
  };

  return (
    <Screen back>
      <View className="gap-2">
        <Text variant="h1">{t('auth.signUp.title')}</Text>
        <Text variant="body" className="text-gray-500">
          {t('auth.signUp.subtitle')}
        </Text>
      </View>

      <SocialButtons onError={setError} />

      <View className="gap-4">
        <TextField
          label={t('auth.fields.fullName')}
          hint={t('auth.fields.fullNameHint')}
          value={fullName}
          onChangeText={setFullName}
          error={msg(fieldErrors.fullName)}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
        />
        <TextField
          label={t('auth.fields.email')}
          value={email}
          onChangeText={setEmail}
          error={msg(fieldErrors.email)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <TextField
          label={t('auth.fields.password')}
          hint={t('auth.fields.passwordHint', { count: MIN_PASSWORD_LENGTH })}
          value={password}
          onChangeText={setPassword}
          error={msg(fieldErrors.password)}
          password
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <CountryPicker value={country} onChange={setCountry} error={msg(fieldErrors.country)} />
        <GenderPicker value={gender} onChange={setGender} />
      </View>

      <FormError error={error} />
      <View className="gap-3">
        <Button testID="sign-up-submit" label={t('auth.signUp.submit')} loading={loading} onPress={() => void submit()} />
        <Text variant="meta" className="text-center">
          {t('auth.signUp.terms')}
        </Text>
      </View>
      <Link href="/sign-in" replace asChild>
        <Button variant="ghost" label={t('auth.signUp.haveAccount')} />
      </Link>
    </Screen>
  );
}
