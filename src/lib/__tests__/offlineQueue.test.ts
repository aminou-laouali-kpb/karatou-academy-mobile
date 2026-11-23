import { classifyStatus, createOfflineQueue, PermanentError, type QueueItem } from '../offlineQueue';

const payload = {
  moduleSlug: 'm',
  courseId: 'c1',
  lang: 'fr',
  results: {},
  startedAt: '2026-11-23T10:00:00Z',
  completedAt: '2026-11-23T10:10:00Z',
};

function setup(overrides: Partial<Parameters<typeof createOfflineQueue>[0]> = {}) {
  let saved: QueueItem[] = [];
  let online = true;
  const sent: string[] = [];
  const reported: string[] = [];
  const queue = createOfflineQueue({
    load: () => saved,
    save: (items) => {
      saved = items;
    },
    isOnline: () => online,
    currentUserId: () => 'u1',
    send: async (item) => {
      sent.push(item.id);
    },
    report: (_e, item) => reported.push(item.id),
    ...overrides,
  });
  return {
    queue,
    sent,
    reported,
    saved: () => saved,
    setOnline: (v: boolean) => {
      online = v;
    },
  };
}

const item = (id: string, userId = 'u1') => ({ id, kind: 'lesson_completed' as const, userId, payload });

describe('offlineQueue', () => {
  it('garde les éléments hors ligne puis les envoie au retour du réseau', async () => {
    const t = setup();
    t.setOnline(false);
    t.queue.enqueue(item('a'));
    t.queue.enqueue(item('a')); // même clé d'idempotence : ignoré
    await t.queue.flush();
    expect(t.sent).toEqual([]);
    expect(t.saved()).toHaveLength(1);
    t.setOnline(true);
    await t.queue.flush();
    expect(t.sent).toEqual(['a']);
    expect(t.queue.items()).toEqual([]);
  });

  it('erreur passagère : garde l’élément et compte la tentative', async () => {
    const t = setup({
      send: async () => {
        throw new Error('Network request failed');
      },
    });
    t.queue.enqueue(item('a'));
    t.queue.enqueue(item('b'));
    await t.queue.flush();
    expect(t.queue.items().map((i) => [i.id, i.attempts])).toEqual([
      ['a', 1],
      ['b', 0],
    ]);
  });

  it('erreur définitive : retire l’élément et le signale', async () => {
    const t = setup({
      send: async () => {
        throw new PermanentError('forbidden');
      },
    });
    t.queue.enqueue(item('a'));
    await t.queue.flush();
    expect(t.queue.items()).toEqual([]);
    expect(t.reported).toEqual(['a']);
  });

  it('n’envoie que les éléments du compte connecté', async () => {
    const t = setup();
    t.queue.enqueue(item('a', 'u2'));
    t.queue.enqueue(item('b'));
    await t.queue.flush();
    expect(t.sent).toEqual(['b']);
    expect(t.queue.items().map((i) => i.id)).toEqual(['a']);
  });

  it('un seul envoi à la fois et notification des abonnés', async () => {
    const t = setup();
    const listener = jest.fn();
    const off = t.queue.subscribe(listener);
    t.queue.enqueue(item('a'));
    const first = t.queue.flush();
    expect(t.queue.flush()).toBe(first);
    await first;
    expect(t.sent).toEqual(['a']);
    expect(listener).toHaveBeenCalledTimes(2);
    off();
  });

  it('classifyStatus', () => {
    expect(classifyStatus(0, { message: 'x' })).not.toBeInstanceOf(PermanentError);
    expect(classifyStatus(undefined, {})).not.toBeInstanceOf(PermanentError);
    expect(classifyStatus(503, { message: 'x' })).not.toBeInstanceOf(PermanentError);
    expect(classifyStatus(429, { message: 'x' })).not.toBeInstanceOf(PermanentError);
    expect(classifyStatus(403, { message: 'x' })).toBeInstanceOf(PermanentError);
  });
});
