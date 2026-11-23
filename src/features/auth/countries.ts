import type { Language } from '@/i18n';

/**
 * Pays proposés à l'inscription : mêmes codes ISO 3166-1 alpha-2 que la web app
 * (`src/data/westAfricaCountries.ts` du repo web), pour que `profiles.country`
 * et les statistiques d'impact restent cohérents. `XX` = « Autre pays ».
 *
 * Comme sur le web, les libellés hausa reprennent les noms français
 * (relecture native bienvenue).
 */
export const WEST_AFRICA_COUNTRIES = [
  { code: 'BJ', fr: 'Bénin', en: 'Benin' },
  { code: 'BF', fr: 'Burkina Faso', en: 'Burkina Faso' },
  { code: 'CV', fr: 'Cap-Vert', en: 'Cabo Verde' },
  { code: 'CI', fr: 'Côte d’Ivoire', en: 'Côte d’Ivoire' },
  { code: 'GM', fr: 'Gambie', en: 'Gambia' },
  { code: 'GH', fr: 'Ghana', en: 'Ghana' },
  { code: 'GN', fr: 'Guinée', en: 'Guinea' },
  { code: 'GW', fr: 'Guinée-Bissau', en: 'Guinea-Bissau' },
  { code: 'LR', fr: 'Libéria', en: 'Liberia' },
  { code: 'ML', fr: 'Mali', en: 'Mali' },
  { code: 'MR', fr: 'Mauritanie', en: 'Mauritania' },
  { code: 'NE', fr: 'Niger', en: 'Niger' },
  { code: 'NG', fr: 'Nigéria', en: 'Nigeria' },
  { code: 'SN', fr: 'Sénégal', en: 'Senegal' },
  { code: 'SL', fr: 'Sierra Leone', en: 'Sierra Leone' },
  { code: 'TG', fr: 'Togo', en: 'Togo' },
] as const;

export const OTHER_COUNTRY_CODE = 'XX';

const VALID_CODES = new Set<string>([...WEST_AFRICA_COUNTRIES.map((c) => c.code), OTHER_COUNTRY_CODE]);

/** Code inconnu → `XX`, comme sur le web : jamais de texte libre dans la colonne. */
export function normalizeCountryCode(value: string | null | undefined): string | undefined {
  const code = value?.trim().toUpperCase();
  if (!code) return undefined;
  return VALID_CODES.has(code) ? code : OTHER_COUNTRY_CODE;
}

/** Libellé du pays ; `otherLabel` est le texte traduit de « Autre pays ». */
export function countryLabel(code: string, lang: Language, otherLabel: string): string {
  if (code === OTHER_COUNTRY_CODE) return otherLabel;
  const country = WEST_AFRICA_COUNTRIES.find((c) => c.code === code);
  if (!country) return code;
  return lang === 'en' ? country.en : country.fr;
}
