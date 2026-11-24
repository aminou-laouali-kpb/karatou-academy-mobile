import { moduleGradient } from '@/theme/moduleGradients';
import { gradients } from '@/theme/tokens';

import { videoLanguage } from '../api';
import { introVideoFor, levelKey, toCatalog, youtubeId, type CourseRow, type ModuleRow } from '../localize';
import { buildPath, completedSet, continueTarget } from '../path';
import type { ProgressRow } from '../types';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));

const course = (id: string, order: number, extra: Partial<CourseRow> = {}): CourseRow => ({
  id,
  title: `Leçon ${id}`,
  description: '',
  duration: '20 min',
  display_order: order,
  status: 'published',
  translations: {},
  ...extra,
});

const moduleRow = (
  slug: string,
  order: number,
  courses: CourseRow[],
  extra: Partial<ModuleRow> = {},
): ModuleRow => ({
  id: `id-${slug}`,
  slug,
  rubrique_id: null,
  title: `Module ${slug}`,
  subtitle: 'Sous-titre',
  description: 'Description',
  emoji: '🤖',
  color: 'from-blue-800 to-blue-600',
  duration: '1h',
  level: 'Débutant',
  is_free: true,
  display_order: order,
  intro_video: {},
  translations: {},
  karatou_courses: courses,
  ...extra,
});

describe('catalogue localisé', () => {
  const rows = [
    moduleRow('b', 2, [course('b1', 1)]),
    moduleRow('a', 1, [course('a2', 2), course('a1', 1), course('a3', 3, { status: 'draft' })], {
      translations: { en: { title: 'AI basics', level: 'Beginner' }, ha: { title: '' } },
      intro_video: { fr: 'https://www.youtube.com/embed/x6-rsUQzkHw' },
    }),
    moduleRow('vide', 3, [course('v1', 1, { status: 'draft' })]),
  ];

  it('trie, garde les leçons publiées et retire les modules vides', () => {
    const catalog = toCatalog(rows, [], 'fr');
    expect(catalog.modules.map((m) => m.slug)).toEqual(['a', 'b']);
    expect(catalog.modules[0]!.lessons.map((l) => l.id)).toEqual(['a1', 'a2']);
  });

  it('prend la traduction, sinon le français', () => {
    const en = toCatalog(rows, [], 'en').modules[0]!;
    expect(en.title).toBe('AI basics');
    expect(en.level).toBe('Beginner');
    expect(en.subtitle).toBe('Sous-titre');
    expect(toCatalog(rows, [], 'ha').modules[0]!.title).toBe('Module a');
  });

  it('retombe sur la vidéo française et lit son identifiant', () => {
    const mod = toCatalog(rows, [], 'ha').modules[0]!;
    expect(introVideoFor(mod, 'ha')).toEqual({
      url: 'https://www.youtube.com/embed/x6-rsUQzkHw',
      lang: 'fr',
    });
    expect(youtubeId('https://www.youtube.com/embed/x6-rsUQzkHw')).toBe('x6-rsUQzkHw');
    expect(youtubeId('https://youtu.be/vIyMyoWzx5o')).toBe('vIyMyoWzx5o');
    expect(youtubeId('https://example.com')).toBeNull();
  });

  it('reconnaît les niveaux stockés en français', () => {
    expect(levelKey('Débutant')).toBe('beginner');
    expect(levelKey('Intermédiaire')).toBe('intermediate');
    expect(levelKey('Mai farawa')).toBeNull();
  });
});

describe('parcours du module', () => {
  const mod = toCatalog(
    [moduleRow('m', 1, [course('c1', 1), course('c2', 2), course('c3', 3), course('c4', 4)])],
    [],
    'fr',
  ).modules[0]!;

  it('ouvre la 1ʳᵉ leçon et verrouille les suivantes au départ', () => {
    const path = buildPath(mod, new Set());
    expect(path.nodes.map((n) => n.state)).toEqual(['current', 'locked', 'locked', 'locked']);
    expect(path.progress).toBe(0);
  });

  it('déverrouille la leçon qui suit une leçon faite, même hors ordre (fait sur le web)', () => {
    const path = buildPath(mod, new Set(['c1', 'c3']));
    expect(path.nodes.map((n) => n.state)).toEqual(['done', 'current', 'done', 'available']);
    expect(path.doneCount).toBe(2);
    expect(path.progress).toBe(0.5);
    expect(path.current?.lesson.id).toBe('c2');
  });

  it('marque le module terminé', () => {
    const path = buildPath(mod, new Set(['c1', 'c2', 'c3', 'c4']));
    expect(path.completed).toBe(true);
    expect(path.current).toBeNull();
  });
});

describe('carte « Continuer »', () => {
  const catalog = toCatalog(
    [
      moduleRow('a', 1, [course('a1', 1), course('a2', 2)]),
      moduleRow('b', 2, [course('b1', 1), course('b2', 2)]),
    ],
    [],
    'fr',
  );
  const row = (moduleSlug: string, courseId: string, completedAt: string): ProgressRow => ({
    moduleSlug,
    courseId,
    completedAt,
  });

  it('propose la 1ʳᵉ leçon du catalogue sans progression', () => {
    const t = continueTarget(catalog.modules, []);
    expect(t?.lesson.id).toBe('a1');
    expect(t?.started).toBe(false);
  });

  it('reprend le module de la dernière activité', () => {
    const rows = [row('a', 'a1', '2026-11-01T10:00:00Z'), row('b', 'b1', '2026-11-20T10:00:00Z')];
    const t = continueTarget(catalog.modules, rows);
    expect(t?.module.slug).toBe('b');
    expect(t?.lesson.id).toBe('b2');
    expect(completedSet(rows, 'a').has('a1')).toBe(true);
  });

  it('passe à un module commencé si le dernier est fini', () => {
    const rows = [
      row('a', 'a1', '2026-11-01T10:00:00Z'),
      row('b', 'b1', '2026-11-20T10:00:00Z'),
      row('b', 'b2', '2026-11-21T10:00:00Z'),
    ];
    expect(continueTarget(catalog.modules, rows)?.lesson.id).toBe('a2');
  });

  it('ne propose rien quand tout est fini', () => {
    const rows = ['a1', 'a2', 'b1', 'b2'].map((id) => row(id[0]!, id, '2026-11-01T10:00:00Z'));
    expect(continueTarget(catalog.modules, rows)).toBeNull();
  });
});

describe('dégradés et vidéo', () => {
  it('traduit les classes Tailwind du web', () => {
    expect(moduleGradient('from-teal-700 to-cyan-500')).toEqual(['#0F766E', expect.any(String)]);
    expect(moduleGradient('n’importe quoi')).toEqual(gradients.blue);
  });

  it('dit si la vidéo est vraiment dans la langue', () => {
    const same = { fr: 'u1', en: 'u1', ha: 'u1' };
    expect(videoLanguage(same, 'ha')).toBe('fr');
    expect(videoLanguage({ fr: 'u1', en: 'u2' }, 'en')).toBe('en');
    expect(videoLanguage(same, 'fr')).toBe('fr');
    expect(videoLanguage(null, 'fr')).toBeNull();
  });
});

describe('mergePending', () => {
  const { mergePending } = jest.requireActual<typeof import('../api')>('../api');
  const row = { moduleSlug: 'm', courseId: 'c1', completedAt: '2026-01-01' };
  const pending = (courseId: string, userId = 'u1') => ({
    userId,
    payload: { moduleSlug: 'm', courseId, completedAt: '2026-11-23' },
  });

  it('ajoute les leçons finies hors ligne, sans doublon ni autre compte', () => {
    expect(mergePending([row], [], 'u1')).toEqual([row]);
    expect(mergePending([row], [pending('c1'), pending('c2'), pending('c3', 'u2')], 'u1')).toEqual([
      row,
      { moduleSlug: 'm', courseId: 'c2', completedAt: '2026-11-23' },
    ]);
    expect(mergePending(undefined, [pending('c2')], 'u1')).toHaveLength(1);
  });

  it('ne coche pas une leçon dont le quiz ne sera pas validé', () => {
    const failed = { userId: 'u1', payload: { ...pending('c2').payload, quizPassed: false } };
    expect(mergePending([row], [failed], 'u1')).toEqual([row]);
  });
});
