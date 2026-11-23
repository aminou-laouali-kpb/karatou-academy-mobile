import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { Button, Screen, Text, TextField } from '@/components/ui';
import { CountryPicker, GenderPicker } from '@/features/auth/components';
import { cleanFullName, GENDERS, type Gender } from '@/features/auth/validation';
import { useProfile, useUpdateProfile, type Profile } from '@/features/profile/api';
import { colors } from '@/theme/tokens';

const isGender = (v: unknown): v is Gender =>
  typeof v === 'string' && (GENDERS as readonly string[]).includes(v);

/** Modification du profil : nom, pays, genre (colonnes modifiables de `profiles`). */
export default function EditProfileScreen() {
  const { data: profile, isError, refetch } = useProfile();
  const { t } = useTranslation();
  if (isError) {
    return (
      <Screen back footer={<Button label={t('common.retry')} onPress={() => void refetch()} />}>
        <Text variant="body">{t('common.error')}</Text>
      </Screen>
    );
  }
  if (!profile) {
    return (
      <Screen back>
        <ActivityIndicator color={colors.blue[500]} />
      </Screen>
    );
  }
  return <EditProfileForm profile={profile} />;
}

function EditProfileForm({ profile }: { profile: Profile }) {
  const { t } = useTranslation();
  const update = useUpdateProfile();
  const [fullName, setFullName] = useState(profile.full_name ?? '');
  const [country, setCountry] = useState(profile.country ?? '');
  const [gender, setGender] = useState<Gender | undefined>(
    isGender(profile.gender) ? profile.gender : undefined,
  );
  const [nameError, setNameError] = useState<string | null>(null);

  const save = () => {
    const name = cleanFullName(fullName);
    if (name.length < 2) return setNameError(t('auth.errors.nameRequired'));
    setNameError(null);
    update.mutate(
      { full_name: name, country: country || null, gender: gender ?? null },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <Screen back footer={<Button label={t('common.save')} loading={update.isPending} onPress={save} />}>
      <Text variant="h1">{t('editProfile.title')}</Text>
      <View className="gap-4">
        <TextField
          label={t('auth.fields.fullName')}
          hint={t('auth.fields.fullNameHint')}
          value={fullName}
          onChangeText={setFullName}
          error={nameError}
          autoCapitalize="words"
          autoComplete="name"
        />
        <CountryPicker value={country} onChange={setCountry} />
        <GenderPicker value={gender} onChange={setGender} />
      </View>
      {update.isError && (
        <Text variant="body" className="text-red-700" accessibilityLiveRegion="polite">
          {t('common.error')}
        </Text>
      )}
    </Screen>
  );
}
