import { View } from 'react-native';

import type { Language } from '@/i18n';
import {
  clearSlot,
  isRequeued,
  moveItem,
  placeWord,
  tapLeft,
  tapRight,
  toggleKey,
  type Draft,
  type Phase,
  type Step,
} from '@/lesson-engine';

import { IntroVideo } from '@/features/catalog/components/IntroVideo';

import { FillBlankStep } from './FillBlankStep';
import { MatchStep } from './MatchStep';
import { McqStep } from './McqStep';
import { MultiStep } from './MultiStep';
import { OrderStep } from './OrderStep';
import {
  ChecklistStep,
  ExplainStep,
  IntroStep,
  PredictRevealStep,
  RecapStep,
  ReflectionStep,
} from './ReadingSteps';
import { TrueFalseStep } from './TrueFalseStep';

export type { Draft };

/** Types d'étapes que le lecteur sait afficher (tous depuis S5). */
export const RENDERABLE: ReadonlySet<Step['type']> = new Set([
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
    case 'multi':
      return (
        <MultiStep
          step={step}
          phase={phase}
          keys={draft.keys ?? []}
          again={isRequeued(step)}
          onToggle={(key) => setDraft(toggleKey(draft, key))}
        />
      );
    case 'true_false':
      return (
        <TrueFalseStep
          step={step}
          phase={phase}
          value={draft.value}
          again={isRequeued(step)}
          onChoose={(value) => setDraft({ ...draft, value })}
        />
      );
    case 'fill_blank':
      return (
        <FillBlankStep
          step={step}
          phase={phase}
          slots={draft.slots ?? step.answer.map(() => null)}
          again={isRequeued(step)}
          onPlace={(index) => setDraft(placeWord(draft, index))}
          onClear={(index) => setDraft(clearSlot(draft, index))}
        />
      );
    case 'order':
      return (
        <OrderStep
          step={step}
          phase={phase}
          order={draft.order ?? step.itemsInOrder}
          again={isRequeued(step)}
          onMove={(index, delta) => setDraft(moveItem(draft, index, delta))}
        />
      );
    case 'match':
      return (
        <MatchStep
          step={step}
          phase={phase}
          draft={draft}
          again={isRequeued(step)}
          onTapLeft={(left) => setDraft(tapLeft(draft, left))}
          onTapRight={(right) => setDraft(tapRight(draft, right, step.pairs.length))}
        />
      );
    case 'reflection':
      return <ReflectionStep step={step} value={reflection} onChange={onReflection} />;
    case 'recap':
      return <RecapStep step={step} />;
  }
}
