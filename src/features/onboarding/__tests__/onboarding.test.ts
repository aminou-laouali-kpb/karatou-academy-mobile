import { act } from '@testing-library/react-native';

import { isQuestionStep, nextStep, QUESTION_STEPS, suggestedReminder } from '../options';
import { useOnboarding } from '../store';

describe('enchaînement des questions', () => {
  it('suit l’ordre de la fiche, puis le plan', () => {
    expect(QUESTION_STEPS).toEqual(['language', 'goal', 'level', 'moment', 'dailyGoal', 'reminder']);
    expect(nextStep('language')).toBe('goal');
    expect(nextStep('reminder')).toBe('plan');
  });

  it('refuse une étape inconnue', () => {
    expect(isQuestionStep('goal')).toBe(true);
    expect(isQuestionStep('plan')).toBe(false);
    expect(isQuestionStep(undefined)).toBe(false);
  });

  it('propose un rappel selon le moment', () => {
    expect(suggestedReminder('morning')).toBe('07:00');
    expect(suggestedReminder('night')).toBe('21:00');
    expect(suggestedReminder(undefined)).toBe('19:00');
  });
});

describe('réponses enregistrées', () => {
  afterEach(() => act(() => useOnboarding.getState().reset()));

  it('garde les réponses et distingue « pas de rappel » de « pas répondu »', () => {
    act(() => {
      useOnboarding.getState().setAnswer('goal', 'career');
      useOnboarding.getState().setAnswer('reminderTime', null);
    });
    expect(useOnboarding.getState().answers).toEqual({ goal: 'career', reminderTime: null });
  });

  it('marque la fin, puis la synchronisation', () => {
    act(() => useOnboarding.getState().complete());
    expect(useOnboarding.getState().completedAt).not.toBeNull();
    expect(useOnboarding.getState().syncedAt).toBeNull();
  });
});
