import { QueryClient } from '@tanstack/react-query';

import { cachedLessonCount, downloadModule, removeModule } from '../service';
import { useDownloads } from '../store';

/** Base factice : `lesson_content` par leçon ; l2 n'a pas de haoussa (repli français). */
const mockDb: Record<string, Record<string, unknown>> = {
  l1: { fr: mockBody('L1 fr'), en: mockBody('L1 en'), ha: mockBody('L1 ha') },
  l2: { fr: mockBody('L2 fr'), en: mockBody('L2 en') },
};
const mockCalls: string[] = [];
let mockFailOn: string | null = null;

function mockBody(title: string) {
  return { title, objective: 'o', content: [{ title: 's', body: 'texte' }], quiz: [], glossary: [] };
}

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: (path: string) => ({
        eq: (_col: string, id: string) => ({
          maybeSingle: async () => {
            const lang = path.split('->')[1]!;
            mockCalls.push(`${id}:${lang}`);
            if (mockFailOn === `${id}:${lang}`) return { data: null, error: new Error('réseau') };
            return { data: { body: mockDb[id]?.[lang] ?? null }, error: null };
          },
        }),
      }),
    }),
  },
}));

const module = {
  slug: 'ia',
  title: 'IA',
  emoji: '🤖',
  lessons: [
    { id: 'l1', title: 'Leçon 1', description: '', duration: '5 min' },
    { id: 'l2', title: 'Leçon 2', description: '', duration: '5 min' },
  ],
};

beforeEach(() => {
  mockCalls.length = 0;
  mockFailOn = null;
});

describe('downloadModule', () => {
  it('met les 3 langues de chaque leçon dans le cache, sous les clés du lecteur', async () => {
    const qc = new QueryClient();
    const progress = jest.fn();
    const entry = await downloadModule(qc, module, progress, () => 42);

    expect(entry).toMatchObject({
      slug: 'ia',
      title: 'IA',
      emoji: '🤖',
      lessonIds: ['l1', 'l2'],
      downloadedAt: 42,
    });
    expect(entry.bytes).toBeGreaterThan(0);
    expect(qc.getQueryData(['lesson', 'l1', 'ha'])).toMatchObject({
      bodyLang: 'ha',
      body: { title: 'L1 ha' },
    });
    // Pas de haoussa pour l2 : repli français, comme dans le lecteur.
    expect(qc.getQueryData(['lesson', 'l2', 'ha'])).toMatchObject({
      bodyLang: 'fr',
      body: { title: 'L2 fr' },
    });
    expect(progress).toHaveBeenNthCalledWith(1, { done: 0, total: 6 });
    expect(progress).toHaveBeenLastCalledWith({ done: 6, total: 6 });
    expect(cachedLessonCount(qc, entry)).toBe(2);
    // Gardé tant que le module n'est pas supprimé.
    expect(qc.getQueryCache().find({ queryKey: ['lesson', 'l1', 'fr'] })?.gcTime).toBe(Infinity);
  });

  it('une erreur réseau arrête le téléchargement', async () => {
    mockFailOn = 'l2:en';
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await expect(downloadModule(qc, module)).rejects.toThrow('réseau');
    expect(mockCalls).not.toContain('l2:ha');
  });

  it('removeModule vide le cache du module', async () => {
    const qc = new QueryClient();
    const entry = await downloadModule(qc, module);
    removeModule(qc, entry);
    expect(qc.getQueryData(['lesson', 'l1', 'fr'])).toBeUndefined();
    expect(cachedLessonCount(qc, entry)).toBe(0);
  });
});

describe('useDownloads', () => {
  it('enregistre, oublie, et garde le réglage Wi-Fi', () => {
    const entry = { slug: 'ia', title: 'IA', emoji: '🤖', lessonIds: ['l1'], bytes: 10, downloadedAt: 1 };
    useDownloads.getState().save(entry);
    expect(useDownloads.getState().modules.ia).toEqual(entry);
    useDownloads.getState().forget('ia');
    expect(useDownloads.getState().modules.ia).toBeUndefined();
    useDownloads.getState().setVideosWifiOnly(true);
    expect(useDownloads.getState().videosWifiOnly).toBe(true);
  });
});
