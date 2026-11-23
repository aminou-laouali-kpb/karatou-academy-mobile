import { View } from 'react-native';

import { cn } from './cn';

export type ProgressTone = 'blue' | 'gold' | 'emerald' | 'orange';

const toneClass: Record<ProgressTone, string> = {
  blue: 'bg-blue-500',
  gold: 'bg-gold-400',
  emerald: 'bg-emerald-500',
  orange: 'bg-orange-500',
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));
}

export type ProgressBarProps = {
  /** Valeur entre 0 et 1. */
  value: number;
  tone?: ProgressTone;
  accessibilityLabel?: string;
  className?: string;
};

/** Barre continue (progression d'un module, niveau suivant). */
export function ProgressBar({ value, tone = 'blue', accessibilityLabel, className }: ProgressBarProps) {
  const v = clamp01(value);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(v * 100) }}
      className={cn('h-3 overflow-hidden rounded-full bg-gray-200', className)}
    >
      <View className={cn('h-full rounded-full', toneClass[tone])} style={{ width: `${v * 100}%` }} />
    </View>
  );
}

export type SegmentedProgressBarProps = {
  total: number;
  /** Nombre de segments terminés. */
  completed: number;
  tone?: ProgressTone;
  accessibilityLabel?: string;
  className?: string;
};

/** Barre segmentée du lecteur de leçon (une case par étape). */
export function SegmentedProgressBar({
  total,
  completed,
  tone = 'blue',
  accessibilityLabel,
  className,
}: SegmentedProgressBarProps) {
  const count = Math.max(0, Math.floor(total));
  const done = Math.min(count, Math.max(0, Math.floor(completed)));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: count, now: done }}
      className={cn('h-2 flex-row gap-1', className)}
    >
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          testID={i < done ? 'segment-done' : 'segment-todo'}
          className={cn('flex-1 rounded-full', i < done ? toneClass[tone] : 'bg-gray-200')}
        />
      ))}
    </View>
  );
}
