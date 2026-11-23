import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';

import { mapAuthError, type AuthErrorKey } from './authErrors';
import { normalizeCountryCode } from './countries';
import { parseAuthCallback } from './deepLink';
import { useAuth } from './store';
import { cleanFullName, normalizeEmail, type Gender } from './validation';

/**
 * URLs de retour : doivent figurer dans les « Redirect URLs » de Supabase Auth
 * (tâche B6 de la fiche). Le schéma `karatou` est déclaré dans app.json.
 */
export const AUTH_CALLBACK_URL = 'karatou://auth/callback';
export const RESET_PASSWORD_URL = 'karatou://reset-password';

export type AuthResult = { ok: true } | { ok: false; error: AuthErrorKey };
export type SignUpResult = AuthResult & { pendingEmailConfirmation?: boolean };

const fail = (error: AuthErrorKey) => ({ ok: false, error }) as const;

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({ email: normalizeEmail(email), password });
  return error ? fail(mapAuthError(error)) : { ok: true };
}

/**
 * Inscription avec les mêmes métadonnées que le web (`full_name`, `country`, `gender`) :
 * c'est le trigger `create_karatou_profile_for_new_user` qui crée le profil.
 * La confirmation d'e-mail est active : sans session, on attend le lien.
 */
export async function signUpWithEmail(input: {
  fullName: string;
  email: string;
  password: string;
  country: string;
  gender?: Gender;
}): Promise<SignUpResult> {
  const country = normalizeCountryCode(input.country);
  const { data, error } = await supabase.auth.signUp({
    email: normalizeEmail(input.email),
    password: input.password,
    options: {
      emailRedirectTo: AUTH_CALLBACK_URL,
      data: {
        full_name: cleanFullName(input.fullName),
        ...(country ? { country } : {}),
        ...(input.gender ? { gender: input.gender } : {}),
      },
    },
  });
  if (error || !data.user) return fail(mapAuthError(error));
  // Supabase ne signale pas un e-mail déjà inscrit (anti-énumération) : il renvoie
  // un utilisateur sans identité.
  if (data.user.identities && data.user.identities.length === 0) return fail('userExists');
  return { ok: true, pendingEmailConfirmation: !data.session };
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
    redirectTo: RESET_PASSWORD_URL,
  });
  return error ? fail(mapAuthError(error)) : { ok: true };
}

export async function updatePassword(password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return fail(mapAuthError(error));
  useAuth.getState().setRecovering(false);
  return { ok: true };
}

/** Échange le `?code=` d'un lien de retour contre une session. */
export async function completeAuthFromUrl(url: string): Promise<AuthResult> {
  const parsed = parseAuthCallback(url);
  if (parsed.kind === 'error') return fail(mapAuthError({ code: parsed.code, message: parsed.description }));
  if (parsed.kind === 'none') return fail('unknown');
  return exchangeCode(parsed.code);
}

export async function exchangeCode(code: string): Promise<AuthResult> {
  // Le même lien peut arriver deux fois (navigateur + routeur) : une session déjà
  // ouverte suffit.
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const { data } = await supabase.auth.getSession();
    return data.session ? { ok: true } : fail(mapAuthError(error));
  }
  return { ok: true };
}

/** Google via le navigateur (OAuth Supabase + PKCE), retour sur karatou://auth/callback. */
export async function signInWithGoogle(): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: AUTH_CALLBACK_URL, skipBrowserRedirect: true },
  });
  if (error || !data.url) return fail(mapAuthError(error));
  const result = await WebBrowser.openAuthSessionAsync(data.url, AUTH_CALLBACK_URL);
  if (result.type !== 'success') return fail('cancelled');
  return completeAuthFromUrl(result.url);
}

/**
 * Sign in with Apple natif (iOS). Apple ne donne le nom qu'à la 1ʳᵉ connexion :
 * on le recopie alors dans les métadonnées et dans le profil s'il est vide.
 */
export async function signInWithApple(): Promise<AuthResult> {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
  } catch (e) {
    return fail((e as { code?: string }).code === 'ERR_REQUEST_CANCELED' ? 'cancelled' : 'unknown');
  }
  if (!credential.identityToken) return fail('unknown');

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    nonce: rawNonce,
  });
  if (error || !data.user) return fail(mapAuthError(error));

  const fullName = cleanFullName(
    [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(' '),
  );
  if (fullName) {
    await supabase.auth.updateUser({ data: { full_name: fullName } });
    await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', data.user.id)
      .is('full_name', null);
  }
  return { ok: true };
}

export async function isAppleSignInAvailable(): Promise<boolean> {
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/**
 * Suppression définitive du compte via l'Edge Function `delete-account`
 * (tâche B5 de la fiche, côté repo web). Exigée par Apple et Google.
 */
export async function deleteAccount(): Promise<AuthResult> {
  const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
  if (error) {
    const status = (error as { context?: { status?: number } }).context?.status;
    return fail(status === 404 ? 'unavailable' : mapAuthError(error));
  }
  await supabase.auth.signOut({ scope: 'local' });
  return { ok: true };
}
