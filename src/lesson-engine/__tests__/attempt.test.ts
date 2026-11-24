import { advance, attemptCounts, check, quizAnswers, quizPassed, retry, startSession, type Step } from '..';

const q = (n: number, answer: string): Step => ({
  type: 'mcq',
  id: `q${n}`,
  prompt: `Question ${n}`,
  options: ['a', 'b', 'c', 'd'].map((key) => ({ key, text: key })),
  answer,
  explanation: '',
});
const mcq = (key: string) => ({ type: 'mcq' as const, key });

/** Joue toute la leçon : `picks[id]` = réponses successives (la dernière se répète). */
function play(steps: Step[], picks: Record<string, string[]>) {
  let session = startSession(steps, 0);
  const tries: Record<string, number> = {};
  for (let guard = 0; guard < 100 && session.finishedAt === null; guard += 1) {
    const step = session.steps[session.index]!;
    if (step.type === 'mcq') {
      const list = picks[step.id] ?? [step.answer];
      const n = tries[step.id] ?? 0;
      tries[step.id] = n + 1;
      session = check(session, mcq(list[Math.min(n, list.length - 1)]!));
      if (session.phase === 'incorrect') {
        session = retry(session);
        continue;
      }
    }
    session = advance(session, 1);
  }
  return session;
}

const steps: Step[] = [{ type: 'explain', id: 's1-1', body: 'Texte' }, q(2, 'c'), q(1, 'b'), q(3, 'a')];

describe('quizAnswers', () => {
  it('suit l’ordre du quiz et garde la réponse donnée avant la correction', () => {
    const session = play(steps, { q1: ['b'], q2: ['a', 'c'], q3: ['d', 'b'], 'q3~again': ['a'] });
    // q3 ratée deux fois : la seconde mauvaise réponse est envoyée, pas celle de la reprise.
    expect(quizAnswers(session)).toEqual(['B', 'C', 'B']);
    expect(attemptCounts(session)).toEqual({ gradedSteps: 3, correctFirstTry: 1, correctAfterRetry: 1 });
  });

  it('ignore les étapes qui ne sont pas des questions du quiz', () => {
    const session = play([{ ...q(1, 'a'), id: 'practice' }, q(1, 'a')], {});
    expect(quizAnswers(session)).toEqual(['A']);
  });

  it('renvoie une réponse vide pour une question jamais atteinte', () => {
    expect(quizAnswers(startSession([q(1, 'a')], 0))).toEqual(['']);
  });
});

describe('quizPassed', () => {
  const five = [q(1, 'a'), q(2, 'a'), q(3, 'a'), q(4, 'a'), q(5, 'a')];

  it('valide à partir de 70 %, comme le serveur', () => {
    expect(quizPassed(play(five, {}))).toBe(true);
    // 4 / 5 = 80 % : validé.
    expect(quizPassed(play(five, { q1: ['b'] }))).toBe(true);
    // 3 / 5 = 60 % : refusé, même si tout est juste à la reprise.
    expect(quizPassed(play(five, { q1: ['b'], q2: ['c'] }))).toBe(false);
  });

  it('une seconde chance réussie compte juste', () => {
    expect(quizPassed(play(five, { q1: ['b', 'a'], q2: ['b', 'a'] }))).toBe(true);
  });

  it('vrai sans quiz', () => {
    expect(quizPassed(play([{ type: 'explain', id: 'x', body: 'y' }], {}))).toBe(true);
  });
});
