import type { Lang } from './types';

/**
 * Corps d'une leçon, tel que stocké dans `karatou_courses.lesson_content[lang]`
 * (même forme que `LessonContent` du web).
 */
export type QuizQuestion = {
  question: string;
  options: { key: string; text: string }[];
  answer: string;
  explanation: string;
};

export type LessonContent = {
  id: string;
  lessonNumber: number;
  title: string;
  objective: string;
  video: Record<Lang, string>;
  content: { title: string; body: string }[];
  example: { title: string; challenge: string; solution: string; impact: string };
  practice: { title: string; instructions: string[]; observation: string };
  quiz: QuizQuestion[];
  reflection: string;
  glossary: { term: string; definition: string }[];
};

const str = (value: unknown): string => (typeof value === 'string' ? value : '');
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Lit un corps de leçon venu de la base (non typé). Même règles que
 * `parseLessonContent` du web : un champ abîmé est ignoré, mais un corps sans
 * titre ni contenu renvoie `null`. Une question dont la réponse n'est pas une
 * des options est retirée (sinon elle bloquerait la leçon).
 */
export function parseLessonContent(value: unknown): LessonContent | null {
  if (!isRecord(value)) return null;
  const title = str(value.title);
  const objective = str(value.objective);
  const content = list(value.content)
    .filter(isRecord)
    .map((section) => ({ title: str(section.title), body: str(section.body) }))
    .filter((section) => section.title || section.body);
  if (!title || (!objective && content.length === 0)) return null;

  const video = isRecord(value.video) ? value.video : {};
  const example = isRecord(value.example) ? value.example : {};
  const practice = isRecord(value.practice) ? value.practice : {};

  const quiz = list(value.quiz)
    .filter(isRecord)
    .map((question) => ({
      question: str(question.question),
      options: list(question.options)
        .filter(isRecord)
        .map((option) => ({ key: str(option.key), text: str(option.text) }))
        .filter((option) => option.key && option.text),
      answer: str(question.answer),
      explanation: str(question.explanation),
    }))
    .filter((question) => question.question && question.options.length >= 2)
    .filter((question) => question.options.some((option) => option.key === question.answer));

  return {
    id: str(value.id),
    lessonNumber: typeof value.lessonNumber === 'number' ? value.lessonNumber : 1,
    title,
    objective,
    video: { fr: str(video.fr), en: str(video.en), ha: str(video.ha) },
    content,
    example: {
      title: str(example.title),
      challenge: str(example.challenge),
      solution: str(example.solution),
      impact: str(example.impact),
    },
    practice: {
      title: str(practice.title),
      instructions: list(practice.instructions).map(str).filter(Boolean),
      observation: str(practice.observation),
    },
    quiz,
    reflection: str(value.reflection),
    glossary: list(value.glossary)
      .filter(isRecord)
      .map((item) => ({ term: str(item.term), definition: str(item.definition) }))
      .filter((item) => item.term && item.definition),
  };
}
