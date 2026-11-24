import { fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';

import i18n from '@/i18n';
import { initialDraft, type Draft, type Phase, type Step } from '@/lesson-engine';
import { SAMPLE_ORDER, SAMPLE_STEPS } from '@/lesson-engine/samples/steps';

import { FeedbackPanel } from '../FeedbackPanel';
import { RENDERABLE, StepRenderer } from '../StepRenderer';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success', Error: 'error' },
  ImpactFeedbackStyle: { Light: 'light' },
}));

// La vidéo (WebView) n'a rien à faire dans ces tests.
jest.mock('@/features/catalog/components/IntroVideo', () => ({ IntroVideo: () => null }));

beforeAll(() => i18n.changeLanguage('fr'));

/** Rend une étape avec un vrai brouillon, comme le lecteur. */
function Harness({
  step,
  phase = 'answering',
  onDraft,
}: {
  step: Step;
  phase?: Phase;
  onDraft?: (d: Draft) => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => initialDraft(step));
  return (
    <StepRenderer
      step={step}
      phase={phase}
      draft={draft}
      setDraft={(next) => {
        setDraft(next);
        onDraft?.(next);
      }}
      lang="fr"
      videoLabel="Vidéo"
      reflection=""
      onReflection={() => {}}
    />
  );
}

const classOf = (testID: string) => String(screen.getByTestId(testID).props.className ?? '');

describe('StepRenderer', () => {
  it('sait afficher tous les types d’étape (S5)', () => {
    expect([...RENDERABLE].sort()).toEqual([...SAMPLE_ORDER].sort());
  });

  it.each(SAMPLE_ORDER.filter((type) => type !== 'video'))('rend l’étape %s sans planter', async (type) => {
    await render(<Harness step={SAMPLE_STEPS[type]} />);
    expect(screen.toJSON()).not.toBeNull();
  });
});

describe('MultiStep', () => {
  it('coche plusieurs options (rôle checkbox)', async () => {
    const onDraft = jest.fn();
    await render(<Harness step={SAMPLE_STEPS.multi} onDraft={onDraft} />);
    expect(screen.getByText('Plusieurs réponses possibles : coche toutes les bonnes.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('checkbox', { name: 'A. La traduction automatique' }));
    await fireEvent.press(screen.getByRole('checkbox', { name: 'C. La reconnaissance vocale' }));
    expect(onDraft).toHaveBeenLastCalledWith({ keys: ['a', 'c'] });
    expect(screen.getByRole('checkbox', { name: 'A. La traduction automatique' })).toBeChecked();
    expect(classOf('multi-a')).toContain('border-blue-500');
  });

  it('au second échec, montre les bonnes en vert et l’erreur en rouge', async () => {
    const Revealed = () => {
      const [draft] = useState<Draft>({ keys: ['a', 'b'] });
      return (
        <StepRenderer
          step={SAMPLE_STEPS.multi}
          phase="revealed"
          draft={draft}
          setDraft={() => {}}
          lang="fr"
          videoLabel=""
          reflection=""
          onReflection={() => {}}
        />
      );
    };
    await render(<Revealed />);
    expect(classOf('multi-a')).toContain('border-emerald-500');
    expect(classOf('multi-b')).toContain('border-red-500');
    expect(classOf('multi-c')).toContain('border-emerald-500');
    expect(classOf('multi-d')).toContain('border-gray-200');
    expect(screen.getByRole('checkbox', { name: 'D. Une lampe torche' })).toBeDisabled();
  });
});

describe('TrueFalseStep', () => {
  it('propose Vrai / Faux en boutons radio', async () => {
    const onDraft = jest.fn();
    await render(<Harness step={SAMPLE_STEPS.true_false} onDraft={onDraft} />);
    expect(screen.getByText('Vrai ou faux ?')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('radio', { name: 'Faux' }));
    expect(onDraft).toHaveBeenLastCalledWith({ value: false });
    expect(screen.getByRole('radio', { name: 'Faux' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Vrai' })).not.toBeChecked();
  });
});

describe('FillBlankStep', () => {
  it('place un mot de la banque dans le premier trou, puis le retire', async () => {
    const onDraft = jest.fn();
    await render(<Harness step={SAMPLE_STEPS.fill_blank} onDraft={onDraft} />);
    expect(screen.getByRole('button', { name: 'Trou 1, vide' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: 'données' }));
    expect(onDraft).toHaveBeenLastCalledWith({ slots: [0, null] });
    expect(screen.getByRole('button', { name: 'données, déjà placé' })).toBeDisabled();
    const slot = screen.getByRole('button', { name: 'Trou 1 : données. Touche pour retirer le mot.' });
    expect(classOf('slot-0')).toContain('border-blue-500');
    await fireEvent.press(slot);
    expect(onDraft).toHaveBeenLastCalledWith({ slots: [null, null] });
  });

  it('montre la phrase complète au second échec', async () => {
    const Revealed = () => (
      <StepRenderer
        step={SAMPLE_STEPS.fill_blank}
        phase="revealed"
        draft={{ slots: [2, 1] }}
        setDraft={() => {}}
        lang="fr"
        videoLabel=""
        reflection=""
        onReflection={() => {}}
      />
    );
    await render(<Revealed />);
    expect(classOf('slot-0')).toContain('border-red-500');
    expect(classOf('slot-1')).toContain('border-emerald-500');
    expect(screen.getByTestId('correct-answer')).toBeOnTheScreen();
  });
});

describe('OrderStep', () => {
  it('monte et descend un élément avec des boutons ≥ 44 pt', async () => {
    const onDraft = jest.fn();
    await render(<Harness step={SAMPLE_STEPS.order} onDraft={onDraft} />);
    const first = initialDraft(SAMPLE_STEPS.order).order!;
    expect(screen.getByRole('button', { name: `Monter « ${first[0]} »` })).toBeDisabled();
    expect(classOf('order-down-0')).toContain('h-11 w-11');
    await fireEvent.press(screen.getByRole('button', { name: `Descendre « ${first[0]} »` }));
    expect(onDraft).toHaveBeenLastCalledWith({ order: [first[1], first[0], first[2], first[3]] });
    expect(screen.getByLabelText(`Position 2 : ${first[0]}`)).toBeOnTheScreen();
  });

  it('colore chaque position après vérification', async () => {
    const items = SAMPLE_STEPS.order.type === 'order' ? SAMPLE_STEPS.order.itemsInOrder : [];
    const Checked = () => (
      <StepRenderer
        step={SAMPLE_STEPS.order}
        phase="incorrect"
        draft={{ order: [items[1]!, items[0]!, items[2]!, items[3]!] }}
        setDraft={() => {}}
        lang="fr"
        videoLabel=""
        reflection=""
        onReflection={() => {}}
      />
    );
    await render(<Checked />);
    expect(classOf('order-item-0')).toContain('border-red-500');
    expect(classOf('order-item-2')).toContain('border-emerald-500');
    expect(screen.queryByTestId('correct-answer')).toBeNull();
  });
});

describe('MatchStep', () => {
  it('appaire un terme et une définition par appui', async () => {
    const onDraft = jest.fn();
    await render(<Harness step={SAMPLE_STEPS.match} onDraft={onDraft} />);
    // Glossaire : pas d'énoncé, la consigne par défaut s'affiche.
    expect(screen.getByText('Associe chaque terme à sa définition.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Modèle' }));
    expect(screen.getByRole('button', { name: 'Modèle' })).toBeSelected();
    await fireEvent.press(
      screen.getByRole('button', { name: 'Programme entraîné qui fait des prédictions' }),
    );
    expect(onDraft).toHaveBeenLastCalledWith({ links: { 1: 1 }, selectedLeft: undefined });
    expect(screen.getByRole('button', { name: 'Modèle, paire 2. Touche pour défaire.' })).toBeOnTheScreen();
    expect(
      screen.getByRole('button', {
        name: 'Programme entraîné qui fait des prédictions, associée à Modèle',
      }),
    ).toBeOnTheScreen();
    expect(screen.getAllByTestId('pair-badge-1')).toHaveLength(2);
  });

  it('montre les bonnes paires au second échec', async () => {
    const Revealed = () => (
      <StepRenderer
        step={SAMPLE_STEPS.match}
        phase="revealed"
        draft={{ links: { 0: 1, 1: 0, 2: 2, 3: 3 } }}
        setDraft={() => {}}
        lang="fr"
        videoLabel=""
        reflection=""
        onReflection={() => {}}
      />
    );
    await render(<Revealed />);
    expect(classOf('left-0')).toContain('border-red-500');
    expect(classOf('left-2')).toContain('border-emerald-500');
    expect(screen.getByTestId('correct-answer')).toBeOnTheScreen();
  });
});

describe('FeedbackPanel', () => {
  const base = { explanation: 'Parce que.', xp: 2, again: false, bottomInset: 0, onPress: jest.fn() };

  it('verte avec « +2 XP » quand c’est juste', async () => {
    await render(<FeedbackPanel {...base} phase="correct" answerLabel="A" />);
    expect(screen.getByText('+2 XP')).toBeOnTheScreen();
    expect(classOf('feedback-panel')).toContain('bg-emerald-50');
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeOnTheScreen();
  });

  it('rouge avec « Réessayer » à la première erreur, sans XP', async () => {
    await render(<FeedbackPanel {...base} phase="incorrect" answerLabel="A" />);
    expect(classOf('feedback-panel')).toContain('bg-red-50');
    expect(screen.queryByTestId('xp-gain')).toBeNull();
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeOnTheScreen();
  });

  it('titre court avec la réponse, ou renvoi vers l’étape', async () => {
    const { rerender } = await render(<FeedbackPanel {...base} phase="revealed" answerLabel="Faux" />);
    expect(screen.getByText(/La bonne réponse : Faux/)).toBeOnTheScreen();
    await rerender(<FeedbackPanel {...base} phase="revealed" answerLabel={null} />);
    expect(screen.getByText(/Voici la bonne réponse/)).toBeOnTheScreen();
  });
});
