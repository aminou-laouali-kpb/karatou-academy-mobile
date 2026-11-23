import type { Lesson, Module, ProgressRow } from './types';

/**
 * Parcours d'un module (E06), logique pure et testée.
 * Une leçon est déverrouillée si elle est faite OU si la précédente est faite
 * (la 1ʳᵉ l'est toujours). « En cours » = la 1ʳᵉ leçon déverrouillée non faite.
 */
export type NodeState = 'done' | 'current' | 'available' | 'locked';

export type PathNode = { lesson: Lesson; index: number; state: NodeState };

export type ModulePath = {
  nodes: PathNode[];
  doneCount: number;
  /** 0 à 1. */
  progress: number;
  completed: boolean;
  current: PathNode | null;
};

export function completedSet(rows: ProgressRow[], moduleSlug: string): Set<string> {
  return new Set(rows.filter((r) => r.moduleSlug === moduleSlug).map((r) => r.courseId));
}

export function buildPath(module: Module, done: Set<string>): ModulePath {
  let current: PathNode | null = null;
  const nodes = module.lessons.map((lesson, index): PathNode => {
    const isDone = done.has(lesson.id);
    const previous = module.lessons[index - 1];
    const unlocked = isDone || index === 0 || (previous !== undefined && done.has(previous.id));
    let state: NodeState = isDone ? 'done' : unlocked ? 'available' : 'locked';
    if (state === 'available' && !current) state = 'current';
    const node = { lesson, index, state };
    if (state === 'current') current = node;
    return node;
  });
  const doneCount = nodes.filter((n) => n.state === 'done').length;
  const total = module.lessons.length;
  return {
    nodes,
    doneCount,
    progress: total ? doneCount / total : 0,
    completed: total > 0 && doneCount === total,
    current,
  };
}

export type ContinueTarget = {
  module: Module;
  lesson: Lesson;
  doneCount: number;
  total: number;
  started: boolean;
};

/**
 * Carte « Continuer » (E04) : le module de la dernière leçon terminée s'il reste
 * quelque chose à faire ; sinon le premier module commencé et non fini ;
 * sinon le premier module du catalogue. `null` si tout est fini.
 */
export function continueTarget(modules: Module[], rows: ProgressRow[]): ContinueTarget | null {
  const target = (module: Module): ContinueTarget | null => {
    const path = buildPath(module, completedSet(rows, module.slug));
    if (!path.current) return null;
    return {
      module,
      lesson: path.current.lesson,
      doneCount: path.doneCount,
      total: module.lessons.length,
      started: path.doneCount > 0,
    };
  };

  const latest = [...rows].sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];
  const recent = latest && modules.find((m) => m.slug === latest.moduleSlug);
  const fromRecent = recent && target(recent);
  if (fromRecent) return fromRecent;

  const startedSlugs = new Set(rows.map((r) => r.moduleSlug));
  for (const module of modules) {
    if (!startedSlugs.has(module.slug)) continue;
    const t = target(module);
    if (t) return t;
  }
  for (const module of modules) {
    const t = target(module);
    if (t) return t;
  }
  return null;
}
