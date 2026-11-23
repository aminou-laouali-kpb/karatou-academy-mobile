import { AntDesign, Ionicons } from '@expo/vector-icons';
import { BottomSheetFlatList, type BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, View } from 'react-native';

import { Button, Chip, Sheet, Text } from '@/components/ui';
import { isLanguage } from '@/i18n';
import { colors } from '@/theme/tokens';

import type { AuthErrorKey } from './authErrors';
import { countryLabel, OTHER_COUNTRY_CODE, WEST_AFRICA_COUNTRIES } from './countries';
import { useEnabledProviders } from './providers';
import { isAppleSignInAvailable, signInWithApple, signInWithGoogle, type AuthResult } from './service';
import { GENDERS, type Gender } from './validation';

/** Message d'erreur de formulaire, annoncé aux lecteurs d'écran. */
export function FormError({ error }: { error: AuthErrorKey | null }) {
  const { t } = useTranslation();
  if (!error) return null;
  return (
    <View
      className="flex-row items-start gap-2 rounded-md bg-red-50 p-3"
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Ionicons name="alert-circle" size={20} color={colors.red[700]} />
      <Text variant="body" className="flex-1 text-red-700">
        {t(`auth.errors.${error}`)}
      </Text>
    </View>
  );
}

/**
 * Google (navigateur) et Apple (natif, iOS seulement), suivis d'un séparateur « ou ».
 * N'affiche que les fournisseurs activés dans Supabase ; rien du tout sinon.
 * Apple est obligatoire sur iOS dès qu'un autre fournisseur social est proposé
 * (règle App Store) : les deux sont activés ensemble (tâche B6).
 */
export function SocialButtons({ onError }: { onError: (error: AuthErrorKey | null) => void }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState<'google' | 'apple' | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const { data: providers } = useEnabledProviders();
  const showGoogle = providers?.google === true;
  const showApple = providers?.apple === true && appleAvailable;

  useEffect(() => {
    if (Platform.OS === 'ios') void isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  const run = async (provider: 'google' | 'apple', action: () => Promise<AuthResult>) => {
    onError(null);
    setBusy(provider);
    const result = await action();
    setBusy(null);
    if (!result.ok && result.error !== 'cancelled') onError(result.error);
    if (result.ok) router.replace('/home');
  };

  if (!showGoogle && !showApple) return null;

  return (
    <View className="gap-3">
      {showGoogle && (
        <Button
          variant="secondary"
          label={t('auth.social.google')}
          icon={<AntDesign name="google" size={20} color={colors.gray[700]} />}
          loading={busy === 'google'}
          disabled={busy !== null}
          onPress={() => void run('google', signInWithGoogle)}
        />
      )}
      {showApple && (
        <Button
          variant="secondary"
          label={t('auth.social.apple')}
          icon={<AntDesign name="apple" size={20} color={colors.gray[900]} />}
          loading={busy === 'apple'}
          disabled={busy !== null}
          onPress={() => void run('apple', signInWithApple)}
        />
      )}
      <OrDivider />
    </View>
  );
}

export function OrDivider() {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center gap-3" importantForAccessibility="no-hide-descendants">
      <View className="h-px flex-1 bg-gray-200" />
      <Text variant="meta">{t('common.or')}</Text>
      <View className="h-px flex-1 bg-gray-200" />
    </View>
  );
}

/** Sélecteur de pays : champ appuyable qui ouvre une feuille avec la liste. */
export function CountryPicker({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (code: string) => void;
  error?: string | null;
}) {
  const { t, i18n } = useTranslation();
  const sheet = useRef<BottomSheetModal>(null);
  const lang = isLanguage(i18n.language) ? i18n.language : 'fr';
  const other = t('auth.fields.otherCountry');
  const options = [...WEST_AFRICA_COUNTRIES.map((c) => c.code as string), OTHER_COUNTRY_CODE];

  return (
    <View className="gap-1.5">
      <Text variant="label" className="text-gray-700">
        {t('auth.fields.country')}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t('auth.fields.country')}, ${value ? countryLabel(value, lang, other) : t('auth.fields.countryPlaceholder')}`}
        onPress={() => sheet.current?.present()}
        className={`min-h-[52px] flex-row items-center rounded-md border-2 bg-white px-4 ${error ? 'border-red-500' : 'border-gray-200'}`}
      >
        <Text variant="body" className={`flex-1 ${value ? '' : 'text-gray-400'}`}>
          {value ? countryLabel(value, lang, other) : t('auth.fields.countryPlaceholder')}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.gray[500]} />
      </Pressable>
      {error ? (
        <Text variant="meta" className="text-red-700">
          {error}
        </Text>
      ) : null}
      <Sheet ref={sheet} snapPoints={['75%']}>
        <Text variant="h2">{t('auth.fields.country')}</Text>
        <BottomSheetFlatList
          data={options}
          keyExtractor={(code) => code}
          style={{ flex: 1 }}
          renderItem={({ item: code }) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: value === code }}
              onPress={() => {
                onChange(code);
                sheet.current?.dismiss();
              }}
              className="min-h-[48px] flex-row items-center justify-between border-b border-gray-100 px-1"
            >
              <Text variant="body" className={value === code ? 'font-body-semibold text-blue-700' : ''}>
                {countryLabel(code, lang, other)}
              </Text>
              {value === code && <Ionicons name="checkmark" size={20} color={colors.blue[500]} />}
            </Pressable>
          )}
        />
      </Sheet>
    </View>
  );
}

/** Genre facultatif : mêmes valeurs que la contrainte `profiles_gender_check`. */
export function GenderPicker({
  value,
  onChange,
}: {
  value?: Gender;
  onChange: (g: Gender | undefined) => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="gap-1.5">
      <Text variant="label" className="text-gray-700">
        {t('auth.fields.gender')} ({t('common.optional')})
      </Text>
      <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
        {GENDERS.map((g) => (
          <Chip
            key={g}
            label={t(`auth.gender.${g}`)}
            selected={value === g}
            onPress={() => onChange(value === g ? undefined : g)}
          />
        ))}
      </View>
    </View>
  );
}
