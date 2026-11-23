/** Clés i18n des erreurs Supabase Auth, sous `auth.errors`. */
export type AuthErrorKey =
  | 'invalidCredentials'
  | 'emailNotConfirmed'
  | 'userExists'
  | 'weakPassword'
  | 'rateLimited'
  | 'network'
  | 'linkExpired'
  | 'samePassword'
  | 'unavailable'
  | 'cancelled'
  | 'unknown';

type MaybeAuthError = { message?: string; code?: string; status?: number; name?: string } | null | undefined;

/**
 * Traduit une erreur Supabase en clé de message. On s'appuie d'abord sur `code`
 * (stable), puis sur le message, pour les versions de GoTrue qui n'en renvoient pas.
 */
export function mapAuthError(error: MaybeAuthError): AuthErrorKey {
  if (!error) return 'unknown';
  const code = error.code ?? '';
  const message = (error.message ?? '').toLowerCase();

  if (code === 'invalid_credentials' || message.includes('invalid login credentials'))
    return 'invalidCredentials';
  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) return 'emailNotConfirmed';
  if (code === 'user_already_exists' || code === 'email_exists' || message.includes('already registered'))
    return 'userExists';
  if (code === 'weak_password' || message.includes('password should be')) return 'weakPassword';
  if (code === 'same_password' || message.includes('should be different')) return 'samePassword';
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit' || error.status === 429)
    return 'rateLimited';
  if (
    code === 'otp_expired' ||
    code === 'flow_state_expired' ||
    code === 'flow_state_not_found' ||
    message.includes('expired')
  )
    return 'linkExpired';
  if (
    error.name === 'AuthRetryableFetchError' ||
    message.includes('network request failed') ||
    message.includes('fetch')
  )
    return 'network';
  return 'unknown';
}
