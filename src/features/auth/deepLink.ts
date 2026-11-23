/**
 * Lecture des liens de retour Supabase Auth (confirmation d'e-mail, OAuth,
 * réinitialisation du mot de passe), en PKCE :
 *   karatou://auth/callback?code=…
 *   karatou://reset-password?code=…
 * et, en cas d'échec, `?error=…&error_code=…&error_description=…`
 * (parfois dans le fragment `#`). Fonction pure, testée.
 */
export type AuthCallback =
  { kind: 'code'; code: string } | { kind: 'error'; code: string; description: string } | { kind: 'none' };

function paramsOf(url: string): URLSearchParams {
  const merged = new URLSearchParams();
  const queryStart = url.indexOf('?');
  const hashStart = url.indexOf('#');
  if (queryStart !== -1) {
    const query = url.slice(queryStart + 1, hashStart > queryStart ? hashStart : undefined);
    new URLSearchParams(query).forEach((value, key) => merged.set(key, value));
  }
  if (hashStart !== -1) {
    new URLSearchParams(url.slice(hashStart + 1)).forEach((value, key) => merged.set(key, value));
  }
  return merged;
}

export function parseAuthCallback(url: string): AuthCallback {
  return parseAuthParams(Object.fromEntries(paramsOf(url)));
}

/** Même lecture à partir des paramètres déjà extraits par Expo Router. */
export function parseAuthParams(params: Record<string, string | string[] | undefined>): AuthCallback {
  const get = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const error = get('error_code') ?? get('error');
  if (error) return { kind: 'error', code: error, description: get('error_description') ?? '' };
  const code = get('code');
  if (code) return { kind: 'code', code };
  return { kind: 'none' };
}
