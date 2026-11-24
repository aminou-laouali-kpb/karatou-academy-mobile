/**
 * Réponse de `karatou_record_lesson_attempt`, lue prudemment : le JSON vient
 * du réseau, un champ absent ne doit pas faire planter l'écran de fin.
 * Pur TS (pas de supabase ni de MMKV) pour rester testable.
 */

export type LocalizedText = Partial<Record<'fr' | 'en' | 'ha', string>>;

export type XpLine = { reason: string; amount: number };

export type AttemptQuest = { key: string; target: number; progress: number; completed: boolean };

export type AttemptBadge = { key: string; name: LocalizedText; icon: string };

export type AttemptResult = {
  status: string;
  xpGained: number;
  xpBreakdown: XpLine[];
  totalXp: number;
  level: number;
  levelUp: boolean;
  streak: { current: number; status: string };
  streakExtended: boolean;
  dailyGoal: { earned: number; target: number; reached: boolean } | null;
  quests: AttemptQuest[];
  newBadges: AttemptBadge[];
  moduleCompleted: boolean;
};

type Json = Record<string, unknown>;

const obj = (value: unknown): Json | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Json) : null;
const num = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);
const str = (value: unknown) => (typeof value === 'string' ? value : '');
const list = (value: unknown) => (Array.isArray(value) ? value : []).map(obj).filter((v): v is Json => v !== null);

function localized(value: unknown): LocalizedText {
  const o = obj(value);
  if (!o) return typeof value === 'string' ? { fr: value, en: value, ha: value } : {};
  return { fr: str(o.fr) || undefined, en: str(o.en) || undefined, ha: str(o.ha) || undefined };
}

/** `null` si la réponse n'a pas la forme attendue (ancienne version de la RPC). */
export function parseAttemptResult(data: unknown): AttemptResult | null {
  const d = obj(data);
  if (!d || typeof d.lesson_status !== 'string' || typeof d.total_xp !== 'number') return null;
  const streak = obj(d.streak);
  const goal = obj(d.daily_goal);
  return {
    status: d.lesson_status,
    xpGained: num(d.xp_gained),
    xpBreakdown: list(d.xp_breakdown).map((l) => ({ reason: str(l.reason), amount: num(l.amount) })),
    totalXp: num(d.total_xp),
    level: num(d.level),
    levelUp: d.level_up === true,
    streak: { current: num(streak?.current), status: str(streak?.status) },
    streakExtended: d.streak_extended === true,
    dailyGoal: goal ? { earned: num(goal.earned), target: num(goal.target), reached: goal.reached === true } : null,
    quests: list(d.quests).map((q) => ({
      key: str(q.key),
      target: num(q.target),
      progress: num(q.progress),
      completed: q.completed === true,
    })),
    newBadges: list(d.new_badges).map((b) => ({ key: str(b.key), name: localized(b.name), icon: str(b.icon) })),
    moduleCompleted: d.module_completed === true,
  };
}

/** Regroupe les lignes d'XP par motif affiché (bonus et rejeu ensemble, quêtes ensemble). */
export function xpRows(lines: XpLine[]): { key: 'lesson' | 'bonus' | 'quests' | 'other'; amount: number }[] {
  const groups = { lesson: 0, bonus: 0, quests: 0, other: 0 };
  for (const { reason, amount } of lines) {
    if (reason === 'lesson_completed') groups.lesson += amount;
    else if (reason === 'lesson_bonus' || reason === 'lesson_replay') groups.bonus += amount;
    else if (reason === 'quest' || reason === 'quest_all') groups.quests += amount;
    else groups.other += amount;
  }
  return (Object.keys(groups) as (keyof typeof groups)[])
    .filter((key) => groups[key] > 0)
    .map((key) => ({ key, amount: groups[key] }));
}

/** Nom d'un badge dans la langue de l'interface, avec repli FR puis EN. */
export const badgeName = (badge: AttemptBadge, lang: string) =>
  badge.name[lang as keyof LocalizedText] ?? badge.name.fr ?? badge.name.en ?? badge.key;

const QUEST_TYPES = [
  'earn_xp',
  'complete_lessons',
  'correct_first_try',
  'watch_video',
  'review_session',
  'daily_goal',
] as const;

export type QuestType = (typeof QUEST_TYPES)[number] | 'other';

/** `complete_lessons_2` → `complete_lessons` : la cible passe en paramètre du texte. */
export function questType(key: string): QuestType {
  const type = key.replace(/_\d+$/, '');
  return (QUEST_TYPES as readonly string[]).includes(type) ? (type as QuestType) : 'other';
}
