import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Card, Screen, Text, TextField } from '@/components/ui';
import type { AuthErrorKey } from '@/features/auth/authErrors';
import { FormError } from '@/features/auth/components';
import { requestPasswordReset } from '@/features/auth/service';
import { validateEmail } from '@/features/auth/validation';

/** Envoi du lien de réinitialisation (retour sur karatou://reset-password). */
export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const invalid = validateEmail(email);
    setEmailError(invalid ? t(`auth.errors.${invalid}`) : null);
    if (invalid) return;
    setError(null);
    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);
    if (result.ok) setSent(true);
    else setError(result.error);
  };

  return (
    <Screen back>
      <View className="gap-2">
        <Text variant="h1">{t('auth.forgot.title')}</Text>
        <Text variant="body" className="text-gray-500">
          {t('auth.forgot.subtitle')}
        </Text>
      </View>
      {sent ? (
        <Card className="border-emerald-500 bg-emerald-50" accessibilityLiveRegion="polite">
          <Text variant="body">{t('auth.forgot.sent', { email })}</Text>
        </Card>
      ) : (
        <>
          <TextField
            label={t('auth.fields.email')}
            value={email}
            onChangeText={setEmail}
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="send"
            onSubmitEditing={() => void submit()}
          />
          <FormError error={error} />
          <Button label={t('auth.forgot.submit')} loading={loading} onPress={() => void submit()} />
        </>
      )}
    </Screen>
  );
}
