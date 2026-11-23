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
  verifyBaseUrl: process.env.EXPO_PUBLIC_VERIFY_BASE_URL ?? 'https://verify.karatou.academy',
} as const;
