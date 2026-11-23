import { View } from 'react-native';

import type { Language } from '@/i18n';
import { isRequeued, type Phase, type Step } from '@/lesson-engine';

import { IntroVideo } from '@/features/catalog/components/IntroVideo';

import { McqStep } from './McqStep';
import {
  ChecklistStep,
  ExplainStep,
  IntroStep,
  PredictRevealStep,
  RecapStep,
  ReflectionStep,
} from './ReadingSteps';

/** Brouillon de l'étape courante (choix, cases cochées…), remis à zéro à chaque étape. */
export type Draft = { choice?: string; revealed?: boolean; checked?: number[] };

/** Types d'étapes affichés en S4 ; les exercices manipulables arrivent en S5. */
export const RENDERABLE: ReadonlySet<Step['type']> = new Set([
  'intro',
  'video',
  'explain',
  'predict_reveal',
  'checklist',
  'mcq',
  'reflection',
  'recap',
]);

export function StepRenderer({
  step,
  phase,
  draft,
  setDraft,
  lang,
  lessonNumber,
  videoLabel,
  reflection,
  onReflection,
}: {
  step: Step;
  phase: Phase;
  draft: Draft;
  setDraft: (draft: Draft) => void;
  lang: Language;
  lessonNumber?: number;
  videoLabel: string;
  reflection: string;
  onReflection: (text: string) => void;
}) {
  switch (step.type) {
    case 'intro':
      return <IntroStep step={step} number={lessonNumber} />;
    case 'video':
      return (
        <View className="pt-4">
          <IntroVideo
            url={`https://www.youtube.com/embed/${step.youtubeId}`}
            videoLang={step.videoLang}
            userLang={lang}
            label={videoLabel}
          />
        </View>
      );
    case 'explain':
      return <ExplainStep step={step} />;
    case 'predict_reveal':
      return <PredictRevealStep step={step} revealed={Boolean(draft.revealed)} />;
    case 'checklist': {
      const checked = draft.checked ?? [];
      return (
        <ChecklistStep
          step={step}
          checked={checked}
          onToggle={(i) =>
            setDraft({
              ...draft,
              checked: checked.includes(i) ? checked.filter((x) => x !== i) : [...checked, i],
            })
          }
        />
      );
    }
    case 'mcq':
      return (
        <McqStep
          step={step}
          phase={phase}
          choice={draft.choice}
          again={isRequeued(step)}
          onChoose={(choice) => setDraft({ ...draft, choice })}
        />
      );
    case 'reflection':
      return <ReflectionStep step={step} value={reflection} onChange={onReflection} />;
    case 'recap':
      return <RecapStep step={step} />;
    default:
      return null;
  }
}
