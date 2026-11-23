import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-mmkv', () => {
  const store = new Map<string, string>();
  return {
    createMMKV: () => ({
      getString: (k: string) => store.get(k),
      set: (k: string, v: string) => store.set(k, v),
      remove: (k: string) => store.delete(k),
    }),
  };
});

// NetInfo n'a pas de module natif sous Jest.
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

// Sentry est livré en ESM : inutile de l'exécuter dans les tests.
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  wrap: <T>(component: T) => component,
}));

// Reanimated 4 / Worklets n'ont pas de module natif sous Jest. Mock léger : les
// composants animés deviennent des View, les animations d'entrée des objets
// chaînables sans effet, et « Réduire les animations » est désactivé.
jest.mock('react-native-reanimated', () => {
  const { View, Text, ScrollView, Image } = require('react-native');
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  for (const method of ['duration', 'delay', 'springify', 'damping', 'reduceMotion', 'withCallback']) {
    builder[method] = chain;
  }
  const Animated = { View, Text, ScrollView, Image, createAnimatedComponent: (c: unknown) => c };
  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
    FadeIn: builder,
    SlideInDown: builder,
    ZoomIn: builder,
    useReducedMotion: () => false,
    useSharedValue: (value: unknown) => ({ value }),
    useAnimatedStyle: (fn: () => unknown) => fn(),
    withTiming: (value: unknown) => value,
    withSpring: (value: unknown) => value,
    withRepeat: (value: unknown) => value,
    withSequence: (...values: unknown[]) => values[values.length - 1],
    cancelAnimation: () => {},
    Easing: { inOut: () => () => 0, ease: () => 0, out: () => () => 0, quad: () => 0 },
  };
});

jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
