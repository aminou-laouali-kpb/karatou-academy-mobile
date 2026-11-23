import PostHog from 'posthog-react-native';

import { env } from './env';

/**
 * Analytics produit (PostHog, cloud UE). Désactivé si la clé est absente :
 * toutes les fonctions deviennent alors des no-op.
 */
export const posthog: PostHog | null = env.posthogKey
  ? new PostHog(env.posthogKey, {
      host: env.posthogHost,
      captureAppLifecycleEvents: true,
      disabled: __DEV__,
    })
  : null;

/** Événements v1 (fiche §9). Étendre ce type à chaque nouvel événement. */
export type AnalyticsEvent =
  | 'onboarding_step_completed'
  | 'signup_completed'
  | 'lesson_started'
  | 'step_answered'
  | 'lesson_completed'
  | 'lesson_abandoned'
  | 'streak_extended'
  | 'streak_broken'
  | 'daily_goal_reached'
  | 'quest_completed'
  | 'badge_earned'
  | 'league_viewed'
  | 'certificate_issued'
  | 'certificate_shared'
  | 'module_downloaded'
  | 'review_session_completed'
  | 'scholarship_redeemed';

export function track(event: AnalyticsEvent, properties?: Record<string, string | number | boolean>) {
  posthog?.capture(event, properties);
}
