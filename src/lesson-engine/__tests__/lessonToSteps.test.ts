import c1 from '../samples/ia-c1.json';
import {
  lessonToSteps,
  parseLessonContent,
  parseMinutes,
  splitIntoCards,
  youtubeIdOf,
  type LessonContent,
} from '..';

const lesson = (lang: 'fr' | 'en' | 'ha') => parseLessonContent(c1[lang]) as LessonContent;

describe('parseLessonContent', () => {
  it('lit un vrai corps de leçon dans les 3 langues', () => {
    for (const lang of ['fr', 'en', 'ha'] as const) {
      const body = lesson(lang);
      expect(body.title).toBeTruthy();
      expect(body.content.length).toBeGreaterThan(0);
      expect(body.quiz.length).toBeGreaterThan(0);
    }
  });

  it('rejette un corps vide ou sans titre', () => {
    expect(parseLessonContent(null)).toBeNull();
    expect(parseLessonContent([])).toBeNull();
    expect(parseLessonContent({ objective: 'x' })).toBeNull();
    expect(parseLessonContent({ title: 'T' })).toBeNull();
  });

  it('garde un corps minimal et ignore les champs abîmés', () => {
    const body = parseLessonContent({
      title: 'T',
      objective: 'O',
      video: 'pas un objet',
      content: [{ title: 'A', body: 'B' }, 'x', { title: '', body: '' }],
      quiz: [
        {
          question: 'Q1',
          options: [
            { key: 'A', text: 'a' },
            { key: 'B', text: 'b' },
          ],
          answer: 'B',
          explanation: '',
        },
        {
          question: 'Q2',
          options: [
            { key: 'A', text: 'a' },
            { key: 'B', text: 'b' },
          ],
          answer: 'Z',
          explanation: '',
        },
        { question: 'Q3', options: [{ key: 'A', text: 'a' }], answer: 'A', explanation: '' },
      ],
      practice: { instructions: ['un', 3, ''] },
      glossary: [{ term: 'X', definition: 'Y' }, { term: 'Z' }],
      lessonNumber: 4,
    });
    expect(body).not.toBeNull();
    expect(body?.content).toEqual([{ title: 'A', body: 'B' }]);
    expect(body?.quiz.map((q) => q.question)).toEqual(['Q1']);
    expect(body?.practice.instructions).toEqual(['un']);
    expect(body?.glossary).toEqual([{ term: 'X', definition: 'Y' }]);
    expect(body?.video).toEqual({ fr: '', en: '', ha: '' });
    expect(body?.lessonNumber).toBe(4);
  });
});

describe('helpers', () => {
  it('parseMinutes', () => {
    expect(parseMinutes('15 min')).toBe(15);
    expect(parseMinutes('1h 30')).toBe(90);
    expect(parseMinutes('1 h')).toBe(60);
    expect(parseMinutes('2h30min')).toBe(150);
    expect(parseMinutes('20')).toBe(20);
    expect(parseMinutes(undefined)).toBe(5);
    expect(parseMinutes('bientôt')).toBe(5);
  });

  it('youtubeIdOf', () => {
    expect(youtubeIdOf('https://www.youtube.com/embed/OlHLuouQCP8')).toBe('OlHLuouQCP8');
    expect(youtubeIdOf('https://www.youtube.com/watch?v=OlHLuouQCP8&t=3')).toBe('OlHLuouQCP8');
    expect(youtubeIdOf('https://youtu.be/OlHLuouQCP8')).toBe('OlHLuouQCP8');
    expect(youtubeIdOf('')).toBeNull();
    expect(youtubeIdOf('javascript:alert(1)')).toBeNull();
  });

  it('splitIntoCards : un paragraphe par carte, coupe les longs entre deux phrases', () => {
    expect(splitIntoCards('Un.\n\nDeux.')).toEqual(['Un.', 'Deux.']);
    const long = Array.from({ length: 10 }, (_, i) => `Phrase ${i} avec quelques mots de plus ici.`).join(
      ' ',
    );
    const cards = splitIntoCards(long, 20);
    expect(cards.length).toBeGreaterThan(1);
    expect(cards.join(' ')).toBe(long);
    for (const card of cards) expect(card.split(' ').length).toBeLessThanOrEqual(20);
  });

  it('splitIntoCards équilibre les cartes', () => {
    const sentence = (n: number) => `${Array.from({ length: n - 1 }, () => 'mot').join(' ')} fin.`;
    // 3 phrases de 25 mots avec un plafond de 60 : 2 cartes (50 + 25), pas 50 + 25 ni 75.
    const cards = splitIntoCards([sentence(25), sentence(25), sentence(25)].join(' '), 60);
    expect(cards).toHaveLength(2);
    // 4 phrases de 20 mots, plafond 60 : 40 + 40 plutôt que 60 + 20.
    const even = splitIntoCards([sentence(20), sentence(20), sentence(20), sentence(20)].join(' '), 60);
    expect(even.map((c) => c.split(' ').length)).toEqual([40, 40]);
  });

  it('splitIntoCards garde une phrase trop longue entière', () => {
    const sentence = Array.from({ length: 30 }, () => 'mot').join(' ');
    expect(splitIntoCards(sentence, 10)).toEqual([sentence]);
  });
});

describe('lessonToSteps', () => {
  it('suit l’ordre de la fiche §6.3', () => {
    const steps = lessonToSteps(lesson('fr'), { lang: 'fr', duration: '20 min' });
    const types = steps.map((s) => s.type);
    expect(types[0]).toBe('intro');
    expect(types[1]).toBe('video');
    expect(types.at(-1)).toBe('recap');
    expect(types).toContain('predict_reveal');
    expect(types).toContain('checklist');
    expect(types).toContain('match');
    expect(types.indexOf('reflection')).toBe(types.length - 2);
    // Une question après chaque section : la 1re question suit la 1re section.
    const firstMcq = types.indexOf('mcq');
    expect(types.slice(2, firstMcq).every((t) => t === 'explain')).toBe(true);
    expect(steps[0]).toMatchObject({ estMinutes: 20 });
    // Ids uniques
    expect(new Set(steps.map((s) => s.id)).size).toBe(steps.length);
  });

  it('toutes les questions du quiz sont reprises', () => {
    const body = lesson('en');
    const steps = lessonToSteps(body, { lang: 'en' });
    expect(steps.filter((s) => s.type === 'mcq')).toHaveLength(body.quiz.length);
  });

  it('saute la vidéo hors ligne et replie sur la vidéo française', () => {
    const body = { ...lesson('ha'), video: { fr: 'https://youtu.be/OlHLuouQCP8', en: '', ha: '' } };
    expect(lessonToSteps(body, { lang: 'ha', offline: true }).some((s) => s.type === 'video')).toBe(false);
    expect(lessonToSteps(body, { lang: 'ha' })[1]).toEqual({
      type: 'video',
      id: 'video',
      youtubeId: 'OlHLuouQCP8',
      videoLang: 'fr',
    });
    const none = { ...body, video: { fr: '', en: '', ha: '' } };
    expect(lessonToSteps(none, { lang: 'ha' }).some((s) => s.type === 'video')).toBe(false);
  });

  it('corps minimal : intro, cartes, récap', () => {
    const body = parseLessonContent({
      title: 'T',
      objective: 'O',
      content: [{ title: 'Seul titre', body: '' }],
      glossary: [{ term: 'X', definition: 'Y' }],
    }) as LessonContent;
    const steps = lessonToSteps(body, { lang: 'fr' });
    expect(steps.map((s) => s.type)).toEqual(['intro', 'explain', 'recap']);
  });

  it('questions sans sections : placées après la pratique', () => {
    const body = parseLessonContent({
      title: 'T',
      objective: 'O',
      content: [],
      quiz: [
        {
          question: 'Q',
          options: [
            { key: 'a', text: '1' },
            { key: 'b', text: '2' },
          ],
          answer: 'a',
          explanation: '',
        },
      ],
      practice: { title: 'P', instructions: ['faire'], observation: '' },
      example: { challenge: 'c', solution: 's', impact: 'i' },
    }) as LessonContent;
    expect(lessonToSteps(body, { lang: 'fr' }).map((s) => s.type)).toEqual([
      'intro',
      'predict_reveal',
      'checklist',
      'mcq',
    ]);
  });
});
