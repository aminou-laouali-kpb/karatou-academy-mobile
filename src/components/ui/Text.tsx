import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from './cn';

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body-lg'
  | 'body'
  | 'label'
  | 'meta'
  | 'eyebrow'
  | 'mono';

const variantClass: Record<TextVariant, string> = {
  display: 'font-heading text-display text-gray-900',
  h1: 'font-heading text-h1 text-gray-900',
  h2: 'font-heading text-h2 text-gray-900',
  h3: 'font-body-semibold text-h3 text-gray-900',
  'body-lg': 'font-body text-body-lg text-gray-900',
  body: 'font-body text-body text-gray-900',
  label: 'font-body-medium text-label text-gray-900',
  meta: 'font-body text-meta text-gray-500',
  eyebrow: 'font-body-semibold text-eyebrow uppercase text-gray-500',
  mono: 'font-code text-body text-gray-900',
};

const headingVariants: TextVariant[] = ['display', 'h1', 'h2', 'h3'];

export type TextProps = RNTextProps & { variant?: TextVariant; className?: string };

/**
 * Texte typographié selon les tokens du §10.2.
 * Respecte la taille de police du système, plafonnée à ×1,3
 * pour que les mises en page tiennent sur les petits écrans.
 */
export function Text({ variant = 'body', className, maxFontSizeMultiplier = 1.3, ...props }: TextProps) {
  return (
    <RNText
      accessibilityRole={headingVariants.includes(variant) ? 'header' : undefined}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      className={cn(variantClass[variant], className)}
      {...props}
    />
  );
}
