import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Card, Screen, Text, TextField } from '@/components/ui';
import type { AuthErrorKey } from '@/features/auth/authErrors';
import { FormError } from '@/features/auth/components';
import { deleteAccount } from '@/features/auth/service';
import { useOnboarding } from '@/features/onboarding/store';
import { queryClient } from '@/lib/queryClient';

/**
 * Suppression du compte dans l'app (exigence Apple et Google).
 * Confirmation explicite : l'apprenant tape le mot demandé.
 */
export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  const word = t('deleteAccount.word');
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const [loading, setLoading] = useState(false);
  const confirmed = typed.trim().toUpperCase() === word.toUpperCase();

  const submit = async () => {
    setError(null);
    setLoading(true);
    const result = await deleteAccount();
    setLoading(false);
    if (!result.ok) return setError(result.error);
    // Plus rien de ce compte ne doit rester sur le téléphone.
    queryClient.clear();
    useOnboarding.getState().reset();
  };

  return (
    <Screen
      back
      footer={
        <Button
          label={t('deleteAccount.submit')}
          disabled={!confirmed}
          loading={loading}
          className="opacity-100"
          onPress={() => void submit()}
        />
      }
    >
      <Text variant="h1">{t('deleteAccount.title')}</Text>
      <Card className="border-red-500 bg-red-50">
        <Text variant="body" className="text-red-700">
          {t('deleteAccount.body')}
        </Text>
      </Card>
      <View className="gap-4">
        <TextField
          label={t('deleteAccount.confirmLabel', { word })}
          value={typed}
          onChangeText={setTyped}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <FormError error={error} />
      </View>
    </Screen>
  );
}
