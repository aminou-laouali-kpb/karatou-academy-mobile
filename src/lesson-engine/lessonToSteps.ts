import type { LessonContent } from './lessonContent';
import type { Lang, Step } from './types';

/** Nombre de mots visé par carte « explication » (fiche §6.3). */
export const MAX_WORDS_PER_CARD = 60;
/** Paires terme ↔ définition au plus dans l'exercice d'association. */
export const MAX_MATCH_PAIRS = 4;

export type LessonToStepsOptions = {
  lang: Lang;
  /** Durée du cours (`karatou_courses.duration`, ex. « 15 min »). */
  duration?: string;
  /** Hors ligne : l'étape vidéo est sautée. */
  offline?: boolean;
};

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

/** Minutes lues dans « 15 min », « 1h 30 », « 1 h » ; 5 par défaut. */
export function parseMinutes(duration: string | undefined): number {
  if (!duration) return 5;
  const hours = /(\d+)\s*h/i.exec(duration);
  const minutes =
    /(\d+)\s*min/i.exec(duration) ?? (hours ? /h\s*(\d+)/i.exec(duration) : /(\d+)/.exec(duration));
  const total = (hours ? Number(hours[1]) * 60 : 0) + (minutes ? Number(minutes[1]) : 0);
  return total > 0 ? total : 5;
}

/** Identifiant YouTube d'une URL (embed, watch, youtu.be) ; `null` sinon. */
export function youtubeIdOf(url: string): string | null {
  const match =
    /(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?(?:.*&)?v=|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(url);
  return match?.[1] ?? null;
}

/**
 * Découpe un texte en cartes : un paragraphe par carte (séparés par une ligne
 * vide), et un paragraphe trop long est coupé entre deux phrases.
 */
export function splitIntoCards(body: string, maxWords = MAX_WORDS_PER_CARD): string[] {
  const cards: string[] = [];
  for (const paragraph of body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)) {
    if (wordCount(paragraph) <= maxWords) {
      cards.push(paragraph);
      continue;
    }
    const sentences = paragraph
      .match(/[^.!?…]+(?:[.!?…]+["»”)]*|$)\s*/g)
      ?.map((s) => s.trim())
      .filter(Boolean) ?? [paragraph];
    // Cartes de taille proche : on coupe là où la carte est la plus près de la taille visée.
    const parts = Math.ceil(wordCount(paragraph) / maxWords);
    const target = Math.ceil(wordCount(paragraph) / parts);
    let current = '';
    for (const sentence of sentences) {
      const candidate = current ? `${current} ${sentence}` : sentence;
      const closeNow = Math.abs(wordCount(current) - target) <= Math.abs(wordCount(candidate) - target);
      if (current && (wordCount(candidate) > maxWords || (wordCount(candidate) > target && closeNow))) {
        cards.push(current);
        current = sentence;
      } else {
        current = candidate;
      }
    }
    if (current) cards.push(current);
  }
  return cards;
}

/**
 * Transforme un corps de leçon existant en suite d'étapes (fiche §6.3) :
 * intro → vidéo → sections (cartes + 1 question après chaque section) →
 * exemple → pratique → questions restantes → glossaire → réflexion → récap.
 */
export function lessonToSteps(lesson: LessonContent, options: LessonToStepsOptions): Step[] {
  const steps: Step[] = [];
  const { lang } = options;

  steps.push({
    type: 'intro',
    id: 'intro',
    title: lesson.title,
    objective: lesson.objective,
    estMinutes: parseMinutes(options.duration),
  });

  if (!options.offline) {
    const own = youtubeIdOf(lesson.video[lang] ?? '');
    const fallback = youtubeIdOf(lesson.video.fr ?? '');
    if (own) steps.push({ type: 'video', id: 'video', youtubeId: own, videoLang: lang });
    else if (fallback) steps.push({ type: 'video', id: 'video', youtubeId: fallback, videoLang: 'fr' });
  }

  const quiz = lesson.quiz.map((question, index) => ({
    type: 'mcq' as const,
    id: `q${index + 1}`,
    prompt: question.question,
    options: question.options,
    answer: question.answer,
    explanation: question.explanation,
  }));
  let nextQuestion = 0;

  lesson.content.forEach((section, sectionIndex) => {
    splitIntoCards(section.body).forEach((body, cardIndex) => {
      steps.push({
        type: 'explain',
        id: `s${sectionIndex + 1}-${cardIndex + 1}`,
        // Le titre de section n'apparaît que sur la première carte.
        ...(cardIndex === 0 && section.title ? { title: section.title } : {}),
        body,
      });
    });
    if (section.body.trim() === '' && section.title) {
      steps.push({ type: 'explain', id: `s${sectionIndex + 1}-1`, body: section.title });
    }
    const question = quiz[nextQuestion];
    if (question) {
      steps.push(question);
      nextQuestion += 1;
    }
  });

  const { example, practice } = lesson;
  if (example.challenge && example.solution) {
    steps.push({
      type: 'predict_reveal',
      id: 'example',
      ...(example.title ? { title: example.title } : {}),
      challenge: example.challenge,
      solution: example.solution,
      impact: example.impact,
    });
  }

  if (practice.instructions.length > 0) {
    steps.push({
      type: 'checklist',
      id: 'practice',
      title: practice.title,
      items: practice.instructions,
      observation: practice.observation,
    });
  }

  steps.push(...quiz.slice(nextQuestion));

  const pairs = lesson.glossary
    .slice(0, MAX_MATCH_PAIRS)
    .map((item) => ({ left: item.term, right: item.definition }));
  if (pairs.length >= 2) steps.push({ type: 'match', id: 'glossary', prompt: '', pairs });

  if (lesson.reflection) steps.push({ type: 'reflection', id: 'reflection', prompt: lesson.reflection });

  const points = lesson.content.map((section) => section.title).filter(Boolean);
  if (points.length > 0) steps.push({ type: 'recap', id: 'recap', points });

  return steps;
}
