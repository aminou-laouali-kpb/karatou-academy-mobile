/**
 * Design tokens Karatou Academy (fiche §10).
 * Source unique : lus par tailwind.config.js (NativeWind) et par le code TS
 * (via tokens.d.ts). Fichier CommonJS car Tailwind le charge sous Node.
 */

const colors = {
  blue: {
    50: '#F0F7FF',
    100: '#DCEBFF',
    200: '#B9D7FF',
    300: '#8BBCFB',
    400: '#4F95F2',
    500: '#1A73E8', // primaire
    600: '#1A52CC',
    700: '#1035A0', // primaire pressé / bord 3D
    800: '#0D2245',
    900: '#0A1628', // fond sombre immersif
  },
  gold: {
    50: '#FFF8EB',
    100: '#FDEBC8',
    400: '#F5A623', // récompense, XP, nœud terminé
    500: '#E8960C',
    700: '#B36F05',
  },
  orange: { 50: '#FFF7ED', 500: '#F97316', 700: '#C2410C' }, // série
  emerald: { 50: '#ECFDF5', 500: '#10B981', 700: '#047857' }, // juste
  red: { 50: '#FEF2F2', 500: '#EF4444', 700: '#B91C1C' }, // faux
  cyan: { 50: '#ECFEFF', 500: '#06B6D4', 700: '#0E7490' }, // gel de série
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

const gradients = {
  blue: ['#1A73E8', '#1A52CC'],
  gold: ['#F5A623', '#E8960C'],
  dark: ['#0A1628', '#0D2245'],
};

/** Noms des familles chargées par expo-font (voir src/theme/fonts.ts). */
const fontFamily = {
  heading: 'Literata_700Bold',
  'heading-semibold': 'Literata_600SemiBold',
  body: 'Inter_400Regular',
  'body-medium': 'Inter_500Medium',
  'body-semibold': 'Inter_600SemiBold',
  'body-bold': 'Inter_700Bold',
  // « code » et non « mono » : le preset NativeWind définit déjà font-mono
  // (Courier / monospace) et l'emporterait sur DM Mono.
  code: 'DMMono_400Regular',
};

/** [taille, { lineHeight, letterSpacing? }] — format Tailwind. */
// Valeurs en px explicites : NativeWind lit un lineHeight sans unité comme un multiplicateur.
const fontSize = {
  display: ['32px', { lineHeight: '38px' }],
  h1: ['26px', { lineHeight: '32px' }],
  h2: ['22px', { lineHeight: '28px' }],
  h3: ['18px', { lineHeight: '24px' }],
  'body-lg': ['17px', { lineHeight: '28px' }],
  body: ['15px', { lineHeight: '24px' }],
  label: ['13px', { lineHeight: '18px' }],
  meta: ['12px', { lineHeight: '16px' }],
  eyebrow: ['11px', { lineHeight: '14px', letterSpacing: '0.88px' }],
};

const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 };

/** Cible tactile minimale (CLAUDE.md, règle 7). */
const minTouchTarget = 44;

module.exports = { colors, gradients, fontFamily, fontSize, radius, minTouchTarget };
