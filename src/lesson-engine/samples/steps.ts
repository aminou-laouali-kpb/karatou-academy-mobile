import type { Step, StepType } from '../types';

/**
 * Données factices de la galerie dev (`app/dev/steps.tsx`) : une étape par
 * type, en français (contenu de leçon, pas texte d'interface). Elles servent
 * aussi de jeu de test aux composants.
 */
export const SAMPLE_STEPS: Record<StepType, Step> = {
  intro: {
    type: 'intro',
    id: 'dev-intro',
    title: "Qu'est-ce que l'intelligence artificielle ?",
    objective: "Savoir expliquer en une phrase ce qu'est une IA et citer deux exemples du quotidien.",
    estMinutes: 8,
  },
  video: { type: 'video', id: 'dev-video', youtubeId: 'OlHLuouQCP8', videoLang: 'fr' },
  explain: {
    type: 'explain',
    id: 'dev-explain',
    title: 'Apprendre à partir d’exemples',
    body: "Une IA ne suit pas seulement des règles écrites à la main : elle apprend à partir de milliers d'exemples. C'est ainsi qu'un téléphone reconnaît une voix ou traduit un message.",
  },
  predict_reveal: {
    type: 'predict_reveal',
    id: 'dev-predict',
    title: 'Le marché de Maradi',
    challenge: 'Une commerçante veut savoir combien de sacs de mil commander pour la semaine prochaine.',
    solution:
      'Elle note ses ventes de chaque semaine ; une IA simple repère la tendance et propose une quantité.',
    impact: 'Moins de stock perdu, moins de ruptures.',
  },
  checklist: {
    type: 'checklist',
    id: 'dev-checklist',
    title: 'Repère l’IA autour de toi',
    items: ['Ouvre ton clavier et observe les mots proposés.', 'Pose une question à un assistant vocal.'],
    observation: 'Les suggestions changent selon ce que tu écris le plus souvent.',
  },
  mcq: {
    type: 'mcq',
    id: 'dev-mcq',
    prompt: 'Comment une IA apprend-elle le plus souvent ?',
    options: [
      { key: 'a', text: 'À partir de nombreux exemples' },
      { key: 'b', text: 'En lisant un seul livre' },
      { key: 'c', text: 'Toute seule, sans données' },
    ],
    answer: 'a',
    explanation: 'Les modèles sont entraînés sur beaucoup d’exemples.',
  },
  multi: {
    type: 'multi',
    id: 'dev-multi',
    prompt: 'Lesquels de ces outils utilisent de l’IA ?',
    options: [
      { key: 'a', text: 'La traduction automatique' },
      { key: 'b', text: 'Une calculatrice de poche' },
      { key: 'c', text: 'La reconnaissance vocale' },
      { key: 'd', text: 'Une lampe torche' },
    ],
    answers: ['a', 'c'],
    explanation: 'Traduire et reconnaître la voix demandent d’apprendre à partir d’exemples.',
  },
  true_false: {
    type: 'true_false',
    id: 'dev-tf',
    statement: 'Une IA comprend le monde exactement comme un être humain.',
    answer: false,
    explanation: 'Elle repère des régularités dans des données ; elle ne « comprend » pas comme nous.',
  },
  fill_blank: {
    type: 'fill_blank',
    id: 'dev-fill',
    template: 'Une IA apprend à partir de {{0}} pour faire des {{1}}.',
    bank: ['données', 'prédictions', 'chansons', 'règles'],
    answer: ['données', 'prédictions'],
    explanation: 'Données en entrée, prédictions en sortie.',
  },
  order: {
    type: 'order',
    id: 'dev-order',
    prompt: 'Remets les étapes d’un projet d’IA dans l’ordre.',
    itemsInOrder: ['Collecter les données', 'Entraîner le modèle', 'Tester le modèle', 'Utiliser le modèle'],
    explanation: 'On ne peut pas entraîner sans données, ni utiliser sans avoir testé.',
  },
  match: {
    type: 'match',
    id: 'dev-match',
    prompt: '',
    pairs: [
      { left: 'Donnée', right: 'Information brute, comme une photo ou un chiffre' },
      { left: 'Modèle', right: 'Programme entraîné qui fait des prédictions' },
      { left: 'Entraînement', right: 'Phase où le modèle apprend à partir d’exemples' },
      { left: 'Biais', right: 'Erreur systématique venue de données déséquilibrées' },
    ],
  },
  reflection: {
    type: 'reflection',
    id: 'dev-reflection',
    prompt: 'Dans ton travail ou ta communauté, quelle tâche répétitive une IA pourrait-elle aider à faire ?',
  },
  recap: {
    type: 'recap',
    id: 'dev-recap',
    points: ['Une IA apprend à partir d’exemples', 'Elle fait des prédictions', 'Ses données comptent'],
  },
};

/** Ordre d'affichage dans la galerie : lecture, puis exercices notés. */
export const SAMPLE_ORDER: StepType[] = [
  'intro',
  'video',
  'explain',
  'predict_reveal',
  'checklist',
  'mcq',
  'multi',
  'true_false',
  'fill_blank',
  'order',
  'match',
  'reflection',
  'recap',
];
