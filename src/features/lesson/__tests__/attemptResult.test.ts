import { badgeName, parseAttemptResult, questType, xpRows } from '../attemptResult';

// Réponse réelle de karatou_record_lesson_attempt (data-analysis/d2, 5/5).
const completed = {
  attempt_id: 'a1',
  lesson_status: 'completed',
  recorded: true,
  replayed_request: false,
  quiz: { correct: 5, total: 5 },
  xp_breakdown: [
    { reason: 'lesson_completed', amount: 20 },
    { reason: 'lesson_bonus', amount: 22 },
    { reason: 'quest', amount: 10 },
  ],
  xp_gained: 52,
  total_xp: 92,
  level: 2,
  level_up: true,
  streak: { status: 'active', current: 1, longest: 1, freezes: 0 },
  streak_extended: true,
  daily_goal: { date: '2026-11-24', target: 30, earned: 52, reached: true },
  quests: [
    { key: 'earn_xp_30', target: 30, progress: 52, completed: true },
    { key: 'complete_lessons_2', target: 2, progress: 1, completed: false },
  ],
  new_badges: [{ key: 'flawless', name: { fr: 'Sans faute', en: 'Flawless', ha: 'Babu kuskure' }, icon: 'sparkles' }],
  module_completed: false,
};

describe('parseAttemptResult', () => {
  it('lit une réponse complète', () => {
    const r = parseAttemptResult(completed);
    expect(r).toMatchObject({
      status: 'completed',
      xpGained: 52,
      totalXp: 92,
      level: 2,
      levelUp: true,
      streak: { current: 1, status: 'active' },
      streakExtended: true,
      dailyGoal: { earned: 52, target: 30, reached: true },
      moduleCompleted: false,
    });
    expect(r?.quests).toHaveLength(2);
    expect(r?.newBadges[0]).toEqual({ key: 'flawless', name: { fr: 'Sans faute', en: 'Flawless', ha: 'Babu kuskure' }, icon: 'sparkles' });
  });

  it('refuse une réponse sans chiffres (quiz raté, rate_limited)', () => {
    expect(parseAttemptResult({ lesson_status: 'failed', recorded: false, quiz: { correct: 1, total: 5 } })).toBeNull();
    expect(parseAttemptResult(null)).toBeNull();
    expect(parseAttemptResult('oops')).toBeNull();
  });

  it('tolère les champs absents ou mal typés', () => {
    const r = parseAttemptResult({ lesson_status: 'replayed', total_xp: 10, quests: [null, 3], streak: 'x' });
    expect(r).toMatchObject({ xpGained: 0, quests: [], newBadges: [], dailyGoal: null, streak: { current: 0 } });
  });
});

describe('xpRows', () => {
  it('regroupe par motif et ignore les zéros', () => {
    expect(
      xpRows([
        { reason: 'lesson_replay', amount: 5 },
        { reason: 'quest', amount: 10 },
        { reason: 'quest_all', amount: 20 },
        { reason: 'certificate_earned', amount: 100 },
      ]),
    ).toEqual([
      { key: 'bonus', amount: 5 },
      { key: 'quests', amount: 30 },
      { key: 'other', amount: 100 },
    ]);
  });
});

describe('questType et badgeName', () => {
  it('retire la cible de la clé de quête', () => {
    expect(questType('complete_lessons_2')).toBe('complete_lessons');
    expect(questType('earn_xp_50')).toBe('earn_xp');
    expect(questType('watch_video')).toBe('watch_video');
    expect(questType('mystery_9')).toBe('other');
  });

  it('choisit la langue avec repli', () => {
    const badge = { key: 'b', name: { fr: 'Premier pas', en: 'First step' }, icon: '' };
    expect(badgeName(badge, 'en')).toBe('First step');
    expect(badgeName(badge, 'ha')).toBe('Premier pas');
    expect(badgeName({ key: 'b', name: {}, icon: '' }, 'fr')).toBe('b');
  });
});
