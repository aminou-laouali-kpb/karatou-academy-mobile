import { createMMKV } from 'react-native-mmkv';

/**
 * Stockage clé-valeur local, synchrone et rapide (MMKV).
 * Sert aux préférences (langue), au cache TanStack Query persisté
 * et, plus tard, à la file hors ligne.
 */
export const storage = createMMKV({ id: 'karatou-academy' });
