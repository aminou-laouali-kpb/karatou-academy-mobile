import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, ProgressBar, SegmentedProgressBar, Text } from '@/components/ui';
import { useAuth } from '@/features/auth/store';
import { useCatalog, useProgress } from '@/features/catalog/api';
import { finishLesson } from '@/features/lesson/finish';
import { lessonKey, useLessonStore } from '@/features/lesson/store';
import type { Language } from '@/i18n';
import {
  advance,
  answerLabel,
  XP,
  check,
  currentStep,
  initialDraft,
  isFinished,
  isGraded,
  isRequeued,
  keepsDraftOnRetry,
  lessonToSteps,
  retry,
  startSession,
  toAnswer,
  type Draft,
  type LessonContent,
  type Session,
  type Step,
} from '@/lesson-engine';
import { useIsOffline } from '@/lib/network';
import { colors } from '@/theme/tokens';

import { FeedbackPanel } from './FeedbackPanel';
import { RENDERABLE, StepRenderer } from './StepRenderer';

/** Nombre d'étapes au-delà duquel la barre segmentée devient continue. */
const MAX_SEGMENTS = 12;

export function Player({
  moduleSlug,
  courseId,
  lang,
  body,
  bodyLang,
  steps: authoredSteps,
  preview = false,
  startAt = 0,
}: {
  moduleSlug: string;
  courseId: string;
  lang: Language;
  body: LessonContent;
  bodyLang: Language;
  /**
   * Étapes rédigées (fiche §6.1, priorité 1). Aujourd'hui seule la galerie dev
   * les fournit. TODO(interactive_steps) : quand la colonne
   * `karatou_courses.interactive_steps` existera (migration dans le repo web),
   * la lire dans `useLessonBody` et la passer ici ; `lessonToSteps` reste le repli.
   */
  steps?: Step[];
  /** Aperçu (écran dev) : rien n'est envoyé au serveur. */
  preview?: boolean;
  /** Écran dev : démarre directement à cette étape. */
  startAt?: number;
}) {
  const { t } = useTranslation();
  const offline = useIsOffline();
  const catalog = useCatalog();
  const progress = useProgress();
  const userId = useAuth((s) => s.session?.user.id);
  const key = lessonKey(moduleSlug, courseId, lang);
  const session = useLessonStore((s) => (s.active?.key === key ? s.active.session : null));
  const setActive = useLessonStore((s) => s.setActive);
  const setLastSummary = useLessonStore((s) => s.setLastSummary);

  const module = catalog.data?.modules.find((m) => m.slug === moduleSlug);
  const lessonIndex = module?.lessons.findIndex((l) => l.id === courseId) ?? -1;
  const lesson = lessonIndex >= 0 ? module?.lessons[lessonIndex] : undefined;

  // Reprend la leçon en cours (appel entrant, app tuée) ou en démarre une nouvelle.
  useEffect(() => {
    if (session && !isFinished(session)) return;
    const steps = (
      authoredSteps ?? lessonToSteps(body, { lang: bodyLang, duration: lesson?.duration, offline })
    ).filter((step) => RENDERABLE.has(step.type));
    const fresh = startSession(steps, Date.now());
    setActive({ key, session: { ...fresh, index: Math.min(startAt, Math.max(0, steps.length - 1)) } });
    // Démarrage unique par leçon : la connexion ou le catalogue qui changent ensuite ne relancent rien.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback((next: Session) => setActive({ key, session: next }), [key, setActive]);

  const close = useCallback(() => {
    const leave = () => {
      setActive(null);
      router.back();
    };
    if (!session || session.index === 0) return leave();
    Alert.alert(t('lesson.quitTitle'), t('lesson.quitBody'), [
      { text: t('lesson.quitCancel'), style: 'cancel' },
      { text: t('lesson.quitConfirm'), style: 'destructive', onPress: leave },
    ]);
  }, [session, setActive, t]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [close]);

  const finish = (done: Session) => {
    if (!userId && !preview) return;
    const alreadyDone = (progress.data ?? []).some(
      (r) => r.moduleSlug === moduleSlug && r.courseId === courseId,
    );
    const summary = finishLesson({
      userId: userId ?? '',
      send: !preview,
      moduleSlug,
      courseId,
      title: lesson?.title ?? body.title,
      lang: bodyLang,
      session: done,
      firstCompletion: !alreadyDone,
    });
    setLastSummary(summary);
    setActive(null);
    router.replace('/lesson-complete');
  };

  const step = session ? currentStep(session) : undefined;
  if (!session || !step) {
    return (
      <Shell onClose={close}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.blue[500]} />
        </View>
      </Shell>
    );
  }

  return (
    <Shell
      onClose={close}
      progress={
        // Au-delà de 12 étapes, les cases deviennent des points : barre continue.
        session.steps.length <= MAX_SEGMENTS ? (
          <SegmentedProgressBar
            total={session.steps.length}
            completed={session.index}
            accessibilityLabel={t('lesson.progress', {
              current: session.index + 1,
              total: session.steps.length,
            })}
          />
        ) : (
          <ProgressBar
            value={session.index / session.steps.length}
            accessibilityLabel={t('lesson.progress', {
              current: session.index + 1,
              total: session.steps.length,
            })}
          />
        )
      }
    >
      <StepView
        key={`${session.index}-${step.id}`}
        session={session}
        lang={lang}
        notice={
          step.type === 'intro' && bodyLang !== lang
            ? t('lesson.bodyLangNotice', { language: t(`language.${lang}`) })
            : undefined
        }
        lessonNumber={lessonIndex >= 0 ? lessonIndex + 1 : undefined}
        reflectionKey={`${moduleSlug}/${courseId}`}
        onUpdate={update}
        onFinish={finish}
      />
    </Shell>
  );
}

/** Une étape : contenu défilant + bouton ou feuille de feedback en bas. Remontée à chaque étape. */
function StepView({
  session,
  lang,
  notice,
  lessonNumber,
  reflectionKey,
  onUpdate,
  onFinish,
}: {
  session: Session;
  lang: Language;
  notice?: string;
  lessonNumber?: number;
  reflectionKey: string;
  onUpdate: (session: Session) => void;
  onFinish: (session: Session) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<Draft>(() => initialDraft(currentStep(session)!));
  const { bottom } = useSafeAreaInsets();
  const reflection = useLessonStore((s) => s.reflections[reflectionKey] ?? '');
  const setReflection = useLessonStore((s) => s.setReflection);
  const step = currentStep(session)!;
  const { phase } = session;

  const next = () => {
    const moved = advance(session, Date.now());
    if (isFinished(moved)) onFinish(moved);
    else onUpdate(moved);
  };

  let footer;
  if (isGraded(step) && phase !== 'answering') {
    footer = (
      <FeedbackPanel
        phase={phase}
        explanation={'explanation' in step ? step.explanation : ''}
        // Réponse courte dans le titre ; sinon (ordre, association) elle est montrée dans l'étape.
        answerLabel={answerLabel(step, { true: t('lesson.true'), false: t('lesson.false') })}
        xp={isRequeued(step) ? 0 : session.misses === 0 ? XP.firstTry : XP.afterRetry}
        again={isRequeued(step)}
        bottomInset={bottom}
        onPress={() => {
          if (phase === 'incorrect') {
            // Seconde chance : on corrige un exercice manipulé, on refait un choix simple.
            setDraft((current) => (keepsDraftOnRetry(step) ? current : initialDraft(step)));
            onUpdate(retry(session));
          } else next();
        }}
      />
    );
  } else {
    const answer = isGraded(step) ? toAnswer(step, draft) : null;
    const cta = isGraded(step)
      ? {
          label: t('lesson.check'),
          disabled: answer === null,
          onPress: () => {
            if (!answer) return;
            const checked = check(session, answer);
            void Haptics.notificationAsync(
              checked.phase === 'correct'
                ? Haptics.NotificationFeedbackType.Success
                : Haptics.NotificationFeedbackType.Error,
            );
            onUpdate(checked);
          },
        }
      : step.type === 'predict_reveal' && !draft.revealed
        ? {
            label: t('lesson.reveal'),
            disabled: false,
            onPress: () => setDraft({ ...draft, revealed: true }),
          }
        : {
            label:
              step.type === 'intro'
                ? t('lesson.start')
                : step.type === 'checklist'
                  ? t('lesson.done')
                  : session.index === session.steps.length - 1
                    ? t('lesson.finish')
                    : t('lesson.continue'),
            disabled: false,
            onPress: next,
          };
    footer = (
      <View className="px-5 pt-3" style={{ paddingBottom: bottom + 8 }}>
        <Button testID="lesson-cta" label={cta.label} disabled={cta.disabled} onPress={cta.onPress} />
      </View>
    );
  }

  return (
    <>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="flex-grow gap-4 px-5 pb-8">
        {notice ? (
          <View className="mt-4 rounded-md bg-gray-100 px-3 py-2">
            <Text variant="meta">{notice}</Text>
          </View>
        ) : null}
        <StepRenderer
          step={step}
          phase={phase}
          draft={draft}
          setDraft={setDraft}
          lang={lang}
          lessonNumber={lessonNumber}
          videoLabel={t('lesson.video')}
          reflection={reflection}
          onReflection={(text) => setReflection(reflectionKey, text)}
        />
      </ScrollView>
      {footer}
    </>
  );
}

/** Cadre du lecteur : bouton ✕ et barre segmentée en haut, plein écran. */
export function Shell({
  children,
  onClose,
  progress,
}: {
  children: React.ReactNode;
  onClose: () => void;
  progress?: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    // Pas de marge basse ici : le bas (bouton ou feuille de feedback) va jusqu'au bord de l'écran.
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="min-h-[52px] flex-row items-center gap-2 px-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('lesson.close')}
            onPress={onClose}
            className="h-11 w-11 items-center justify-center"
          >
            <Ionicons name="close" size={28} color={colors.gray[500]} />
          </Pressable>
          <View className="flex-1 pr-2">{progress}</View>
        </View>
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
