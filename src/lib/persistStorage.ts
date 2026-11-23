import { createJSONStorage } from 'zustand/middleware';

import { storage } from './storage';

/** Adaptateur MMKV pour `zustand/middleware` (persist). */
export const mmkvJSONStorage = createJSONStorage(() => ({
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => {
    storage.remove(name);
  },
}));
