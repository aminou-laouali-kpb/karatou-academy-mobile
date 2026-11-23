import * as Sentry from '@sentry/react-native';

import { env } from './env';

export const sentryEnabled = Boolean(env.sentryDsn);

/** Initialise Sentry seulement si un DSN est fourni. */
export function initSentry() {
  if (!sentryEnabled) return;
  Sentry.init({
    dsn: env.sentryDsn,
    sendDefaultPii: false, // aligné sur la web app
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    enabled: !__DEV__,
  });
}

export { Sentry };
