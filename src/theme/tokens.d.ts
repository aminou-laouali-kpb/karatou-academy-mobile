type Scale<K extends string | number> = Record<K, string>;
type FullScale = Scale<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900>;
type StatusScale = Scale<50 | 500 | 700>;

export declare const colors: {
  blue: FullScale;
  gold: Scale<50 | 100 | 400 | 500 | 700>;
  orange: StatusScale;
  emerald: StatusScale;
  red: StatusScale;
  cyan: StatusScale;
  gray: FullScale;
  white: string;
  black: string;
  transparent: string;
};

export declare const gradients: {
  blue: [string, string];
  gold: [string, string];
  dark: [string, string];
};

export declare const fontFamily: Record<
  'heading' | 'heading-semibold' | 'body' | 'body-medium' | 'body-semibold' | 'body-bold' | 'code',
  string
>;

export declare const fontSize: Record<
  'display' | 'h1' | 'h2' | 'h3' | 'body-lg' | 'body' | 'label' | 'meta' | 'eyebrow',
  [string, { lineHeight: string; letterSpacing?: string }]
>;

export declare const radius: Record<'sm' | 'md' | 'lg' | 'xl' | 'full', number>;

export declare const minTouchTarget: number;
