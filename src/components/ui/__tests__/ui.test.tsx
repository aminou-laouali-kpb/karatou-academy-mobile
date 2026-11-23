import { fireEvent, render, screen } from '@testing-library/react-native';

import { Avatar, initialsOf } from '../Avatar';
import { Button } from '../Button';
import { Chip } from '../Chip';
import { ProgressBar, SegmentedProgressBar } from '../ProgressBar';

describe('Button', () => {
  it('appelle onPress et expose un rôle accessible', async () => {
    const onPress = jest.fn();
    await render(<Button label="Continuer" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ne réagit pas quand il est désactivé ou en chargement', async () => {
    const onPress = jest.fn();
    const { rerender } = await render(<Button label="Vérifier" disabled onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button'));
    await rerender(<Button label="Vérifier" loading onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('Chip', () => {
  it('annonce son état sélectionné', async () => {
    await render(<Chip label="IA" selected />);
    expect(screen.getByRole('button', { name: 'IA' })).toBeSelected();
  });
});

describe('ProgressBar', () => {
  it('borne la valeur entre 0 et 100 %', async () => {
    await render(<ProgressBar value={1.7} accessibilityLabel="p" />);
    expect(screen.getByLabelText('p').props.accessibilityValue.now).toBe(100);
  });

  it('affiche un segment par étape', async () => {
    await render(<SegmentedProgressBar total={5} completed={2} />);
    expect(screen.getAllByTestId('segment-done')).toHaveLength(2);
    expect(screen.getAllByTestId('segment-todo')).toHaveLength(3);
  });
});

describe('Avatar', () => {
  it.each([
    ['Aïcha Moussa', 'AM'],
    ['Fatouma', 'F'],
    ['  ibrahim  sani  dan ', 'ID'],
    ['', '?'],
  ])('initiales de « %s » = %s', (name, expected) => {
    expect(initialsOf(name)).toBe(expected);
  });

  it('affiche les initiales sans image', async () => {
    await render(<Avatar name="Aïcha Moussa" />);
    expect(screen.getByText('AM')).toBeTruthy();
  });
});
