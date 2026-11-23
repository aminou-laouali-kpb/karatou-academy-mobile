import { colors, gradients } from './tokens';

/**
 * Les couleurs de modules et de rubriques sont stockées comme classes Tailwind du web
 * (`from-blue-800 to-blue-600`). Cette table les traduit pour expo-linear-gradient
 * (fiche §10.1). Les teintes absentes de nos tokens reprennent la palette Tailwind.
 */
const PALETTE: Record<string, string> = {
  'blue-500': colors.blue[500],
  'blue-600': colors.blue[600],
  'blue-800': colors.blue[800],
  'cyan-500': colors.cyan[500],
  'cyan-700': colors.cyan[700],
  'emerald-700': colors.emerald[700],
  'gold-500': colors.gold[500],
  'orange-500': colors.orange[500],
  'orange-600': '#EA580C',
  'amber-500': '#F59E0B',
  'lime-500': '#84CC16',
  'teal-600': '#0D9488',
  'teal-700': '#0F766E',
  'indigo-700': '#4338CA',
  'slate-700': '#334155',
};

export function moduleGradient(className: string): [string, string] {
  const from = className.match(/from-([a-z]+-\d{2,3})/)?.[1];
  const to = className.match(/to-([a-z]+-\d{2,3})/)?.[1];
  const start = from ? PALETTE[from] : undefined;
  const end = to ? PALETTE[to] : undefined;
  if (!start || !end) return gradients.blue;
  return [start, end];
}
