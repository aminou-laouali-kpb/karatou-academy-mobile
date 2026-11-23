/**
 * Variables publiques (préfixe EXPO_PUBLIC_, intégrées au bundle).
 * Jamais de clé service_role ici (CLAUDE.md, règle 2).
 */
export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  posthogKey: process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '',
  posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
  /** Web app (espace admin, liens « ouvrir sur le web »). */
  webAppUrl: process.env.EXPO_PUBLIC_WEB_APP_URL ?? 'https://course.karatou.academy',
  verifyBaseUrl: process.env.EXPO_PUBLIC_VERIFY_BASE_URL ?? 'https://verify.karatou.academy',
} as const;
