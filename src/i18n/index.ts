import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { storage } from '@/lib/storage';

import en from './locales/en.json';
import fr from './locales/fr.json';
import ha from './locales/ha.json';

export const SUPPORTED_LANGUAGES = ['fr', 'en', 'ha'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const STORAGE_KEY = 'app.language';

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

/** Langue enregistrée, sinon langue du téléphone si gérée, sinon français. */
export function detectInitialLanguage(): Language {
  const saved = storage.getString(STORAGE_KEY);
  if (isLanguage(saved)) return saved;
  const deviceLang = getLocales()[0]?.languageCode;
  return isLanguage(deviceLang) ? deviceLang : 'fr';
}

export const resources = {
  fr: { translation: fr },
  en: { translation: en },
  ha: { translation: ha },
} as const;

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources,
  lng: detectInitialLanguage(),
  fallbackLng: 'fr',
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: { escapeValue: false },
  returnNull: false,
});

/** Change la langue à chaud et la mémorise. */
export async function setLanguage(lang: Language) {
  storage.set(STORAGE_KEY, lang);
  await i18n.changeLanguage(lang);
}

export default i18n;
