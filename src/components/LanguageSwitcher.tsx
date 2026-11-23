import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { setLanguage, SUPPORTED_LANGUAGES } from '@/i18n';

import { Chip } from './ui';

/** Choix de langue FR / EN / HA, appliqué à chaud. */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={t('language.label')} className="flex-row gap-2">
      {SUPPORTED_LANGUAGES.map((lang) => (
        <Chip
          key={lang}
          label={t(`language.${lang}`)}
          selected={i18n.language === lang}
          onPress={() => void setLanguage(lang)}
        />
      ))}
    </View>
  );
}
