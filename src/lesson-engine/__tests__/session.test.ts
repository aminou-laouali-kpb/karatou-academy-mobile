import {
  accuracy,
  advance,
  canAdvance,
  check,
  currentStep,
  estimateXp,
  isCorrect,
  isFinished,
  isGraded,
  progressOf,
  resultsOf,
  retry,
  startSession,
  type GradedStep,
  type Step,
} from '..';

const mcq = (id: string): Step => ({
  type: 'mcq',
  id,
  prompt: 'Q',
  options: [
    { key: 'A', text: 'a' },
    { key: 'B', text: 'b' },
  ],
  answer: 'B',
  explanation: 'Parce que.',
});
const explain: Step = { type: 'explain', id: 'e1', body: 'Texte' };
const right = { type: 'mcq', key: 'B' } as const;
const wrong = { type: 'mcq', key: 'A' } as const;

describe('isCorrect', () => {
  it('note chaque type', () => {
    expect(isCorrect(mcq('q') as never, right)).toBe(true);
    expect(isCorrect(mcq('q') as never, wrong)).toBe(false);
    expect(isCorrect(mcq('q') as never, { type: 'true_false', value: true })).toBe(false);
    const multi: GradedStep = {
      type: 'multi',
      id: 'm',
      prompt: '',
      options: [],
      answers: ['a', 'c'],
      explanation: '',
    };
    expect(isCorrect(multi, { type: 'multi', keys: ['c', 'a'] })).toBe(true);
    expect(isCorrect(multi, { type: 'multi', keys: ['a'] })).toBe(false);
    expect(isCorrect(multi, { type: 'multi', keys: ['a', 'b'] })).toBe(false);
    const tf: GradedStep = { type: 'true_false', id: 't', statement: '', answer: false, explanation: '' };
    expect(isCorrect(tf, { type: 'true_false', value: false })).toBe(true);
    expect(isCorrect(tf, { type: 'true_false', value: true })).toBe(false);
    const fill: GradedStep = {
      type: 'fill_blank',
      id: 'f',
      template: '{{0}} {{1}}',
      bank: [],
      answer: ['x', 'y'],
      explanation: '',
    };
    expect(isCorrect(fill, { type: 'fill_blank', words: ['x', 'y'] })).toBe(true);
    expect(isCorrect(fill, { type: 'fill_blank', words: ['y', 'x'] })).toBe(false);
    const order: GradedStep = {
      type: 'order',
      id: 'o',
      prompt: '',
      itemsInOrder: ['1', '2', '3'],
      explanation: '',
    };
    expect(isCorrect(order, { type: 'order', items: ['1', '2', '3'] })).toBe(true);
    expect(isCorrect(order, { type: 'order', items: ['2', '1', '3'] })).toBe(false);
    const match: GradedStep = {
      type: 'match',
      id: 'g',
      prompt: '',
      pairs: [
        { left: 'a', right: '1' },
        { left: 'b', right: '2' },
      ],
    };
    expect(
      isCorrect(match, {
        type: 'match',
        pairs: [
          { left: 'b', right: '2' },
          { left: 'a', right: '1' },
        ],
      }),
    ).toBe(true);
    expect(
      isCorrect(match, {
        type: 'match',
        pairs: [
          { left: 'a', right: '2' },
          { left: 'b', right: '1' },
        ],
      }),
    ).toBe(false);
    expect(isCorrect(match, { type: 'match', pairs: [{ left: 'a', right: '1' }] })).toBe(false);
  });

  it('isGraded', () => {
    expect(isGraded(mcq('q'))).toBe(true);
    expect(isGraded(explain)).toBe(false);
  });
});

describe('session', () => {
  it('étape non notée : Continuer directement', () => {
    let s = startSession([explain, mcq('q1')], 0);
    expect(currentStep(s)).toBe(explain);
    expect(canAdvance(s)).toBe(true);
    expect(check(s, right)).toBe(s);
    s = advance(s, 1);
    expect(s.index).toBe(1);
    expect(progressOf(s)).toBe(0.5);
  });

  it('juste du premier coup', () => {
    let s = startSession([mcq('q1')], 0);
    expect(canAdvance(s)).toBe(false);
    expect(advance(s, 1)).toBe(s);
    s = check(s, right);
    expect(s.phase).toBe('correct');
    expect(s.results).toEqual({ q1: 'firstTry' });
    expect(check(s, wrong)).toBe(s);
    s = advance(s, 5);
    expect(isFinished(s)).toBe(true);
    expect(s.finishedAt).toBe(5);
    expect(progressOf(s)).toBe(1);
  });

  it('juste après une seconde chance', () => {
    let s = startSession([mcq('q1')], 0);
    s = check(s, wrong);
    expect(s.phase).toBe('incorrect');
    expect(canAdvance(s)).toBe(false);
    s = retry(s);
    expect(s.phase).toBe('answering');
    expect(retry(s)).toBe(s);
    s = check(s, right);
    expect(s.results).toEqual({ q1: 'afterRetry' });
  });

  it('deux échecs : réponse montrée et question reposée en fin de leçon', () => {
    let s = startSession([mcq('q1'), explain], 0);
    s = retry(check(s, wrong));
    s = check(s, wrong);
    expect(s.phase).toBe('revealed');
    expect(s.results).toEqual({ q1: 'failed' });
    expect(s.steps.map((step) => step.id)).toEqual(['q1', 'e1', 'q1~again']);
    s = advance(advance(s, 1), 2);
    expect(currentStep(s)?.id).toBe('q1~again');
    // Juste sur la question reposée : passée, résultat inchangé.
    const passed = check(s, right);
    expect(passed.phase).toBe('correct');
    expect(passed.results).toEqual({ q1: 'failed' });
    // Faux sur la question reposée : un seul essai, réponse montrée, pas de 3e passage.
    const again = check(s, wrong);
    expect(again.phase).toBe('revealed');
    expect(again.steps).toHaveLength(3);
    expect(isFinished(advance(again, 3))).toBe(true);
    expect(resultsOf(again)).toEqual(['failed']);
  });

  it('leçon vide : terminée d’emblée', () => {
    const s = startSession([], 7);
    expect(isFinished(s)).toBe(true);
    expect(progressOf(s)).toBe(1);
    expect(canAdvance(s)).toBe(false);
  });
});

describe('XP et précision', () => {
  it('estimateXp : barème de la fiche §7.1', () => {
    expect(estimateXp(['firstTry', 'firstTry'], true)).toEqual({
      completion: 20,
      steps: 4,
      perfect: 10,
      total: 34,
    });
    expect(estimateXp(['firstTry', 'afterRetry', 'failed'], true)).toEqual({
      completion: 20,
      steps: 3,
      perfect: 0,
      total: 23,
    });
    expect(estimateXp([], true)).toEqual({ completion: 20, steps: 0, perfect: 0, total: 20 });
    // Rejouée : 25 % du bonus, pas les 20 XP.
    expect(estimateXp(['firstTry', 'firstTry', 'firstTry', 'firstTry'], false)).toEqual({
      completion: 0,
      steps: 2,
      perfect: 3,
      total: 5,
    });
  });

  it('accuracy', () => {
    expect(accuracy([])).toBe(1);
    expect(accuracy(['firstTry', 'afterRetry', 'failed', 'failed'])).toBe(0.5);
  });
});
