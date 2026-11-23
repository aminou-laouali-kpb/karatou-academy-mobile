import { extendTailwindMerge } from 'tailwind-merge';

import { fontFamily, fontSize } from '@/theme/tokens';

// Sans cette config, tailwind-merge prendrait `text-h1` pour une couleur
// et l'écraserait avec `text-white`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: Object.keys(fontSize) }],
      'font-family': [{ font: Object.keys(fontFamily) }],
    },
  },
});

/**
 * Fusionne des classes NativeWind : ignore les valeurs vides et, en cas de conflit
 * (deux couleurs de texte…), garde la dernière. Le `className` passé à un composant
 * l'emporte donc sur ses classes par défaut.
 */
export function cn(...classes: (string | false | null | undefined)[]) {
  return twMerge(classes.filter(Boolean).join(' '));
}
