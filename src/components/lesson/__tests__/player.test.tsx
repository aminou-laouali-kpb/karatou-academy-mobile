import { fireEvent, render, screen } from '@testing-library/react-native';

import i18n from '@/i18n';
import { useLessonStore } from '@/features/lesson/store';
import type { LessonContent, Step } from '@/lesson-engine';
import { SAMPLE_STEPS } from '@/lesson-engine/samples/steps';

import { Player } from '../LessonPlayer';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success', Error: 'error' },
  ImpactFeedbackStyle: { Light: 'light' },
}));
jest.mock('expo-router', () => ({ router: { back: jest.fn(), replace: jest.fn(), push: jest.fn() } }));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return { SafeAreaView: View, useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) };
});
jest.mock('@/features/catalog/api', () => ({
  useCatalog: () => ({ data: undefined }),
  useProgress: () => ({ data: [] }),
}));
jest.mock('@/features/catalog/components/IntroVideo', () => ({ IntroVideo: () => null }));

const body = { title: 'Démo' } as LessonContent;

async function play(steps: Step[], id: string) {
  await render(
    <Player moduleSlug="dev" courseId={id} lang="fr" body={body} bodyLang="fr" steps={steps} preview />,
  );
}

beforeAll(() => i18n.changeLanguage('fr'));
beforeEach(() => useLessonStore.getState().setActive(null));

describe('Player : exercices S5', () => {
  it('vrai/faux : Vérifier désactivé, puis feuille verte avec +2 XP', async () => {
    await play([SAMPLE_STEPS.true_false, SAMPLE_STEPS.recap], 'tf');
    expect(screen.getByRole('button', { name: 'Vérifier' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('radio', { name: 'Faux' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Vérifier' }));
    expect(screen.getByText('+2 XP')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }));
    expect(screen.getByText(/À retenir/)).toBeOnTheScreen();
  });

  it('association du glossaire : seconde chance qui garde les paires, puis question reposée', async () => {
    const step = {
      ...SAMPLE_STEPS.match,
      pairs: SAMPLE_STEPS.match.type === 'match' ? SAMPLE_STEPS.match.pairs.slice(0, 2) : [],
    } as Step;
    await play([step], 'match');
    const pairs = step.type === 'match' ? step.pairs : [];
    // Appairage inversé (faux).
    await fireEvent.press(screen.getByRole('button', { name: pairs[0]!.left }));
    await fireEvent.press(screen.getByRole('button', { name: pairs[1]!.right }));
    expect(screen.getByRole('button', { name: 'Vérifier' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: pairs[1]!.left }));
    await fireEvent.press(screen.getByRole('button', { name: pairs[0]!.right }));
    await fireEvent.press(screen.getByRole('button', { name: 'Vérifier' }));
    expect(screen.getByText(/Pas tout à fait/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Réessayer' }));
    // Le brouillon est gardé : les deux paires sont toujours là.
    expect(screen.getAllByTestId('pair-badge-0')).toHaveLength(2);
    await fireEvent.press(screen.getByRole('button', { name: 'Vérifier' }));
    expect(screen.getByText(/Voici la bonne réponse/)).toBeOnTheScreen();
    expect(screen.getByTestId('correct-answer')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }));
    // Question reposée en fin de leçon.
    expect(screen.getByText('Question revue')).toBeOnTheScreen();
  });

  it('remise en ordre : la réponse mélangée peut être corrigée puis validée', async () => {
    const step: Step = {
      type: 'order',
      id: 'o',
      prompt: 'Range',
      itemsInOrder: ['A1', 'B2'],
      explanation: '',
    };
    await play([step], 'order');
    // Deux éléments : le mélange les inverse toujours.
    expect(screen.getByLabelText('Position 1 : B2')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Descendre « B2 »' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Vérifier' }));
    expect(screen.getByText('Bien joué !', { exact: false })).toBeOnTheScreen();
  });
});
