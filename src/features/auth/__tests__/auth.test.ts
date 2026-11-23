import { mapAuthError } from '../authErrors';
import { countryLabel, normalizeCountryCode, OTHER_COUNTRY_CODE, WEST_AFRICA_COUNTRIES } from '../countries';
import { parseAuthCallback, parseAuthParams } from '../deepLink';
import { parseEnabledProviders } from '../providers';
import { normalizeUserRole, webAdminPath } from '../roles';
import { cleanFullName, validateEmail, validateNewPassword, validateSignUp } from '../validation';

describe('roles', () => {
  it('normalise comme la web app', () => {
    expect(normalizeUserRole('admin')).toBe('platform_admin');
    expect(normalizeUserRole(' Platform_Admin ')).toBe('platform_admin');
    expect(normalizeUserRole('org_admin')).toBe('enterprise_admin');
    expect(normalizeUserRole(undefined)).toBe('learner');
    expect(normalizeUserRole('superuser')).toBe('learner');
  });

  it("ne donne un lien d'administration web qu'aux admins", () => {
    expect(webAdminPath('learner')).toBeNull();
    expect(webAdminPath('platform_admin')).toBe('/admin');
    expect(webAdminPath('enterprise_admin')).toBe('/enterprise');
  });
});

describe('pays', () => {
  it('propose les 16 pays d’Afrique de l’Ouest', () => {
    expect(WEST_AFRICA_COUNTRIES).toHaveLength(16);
  });

  it('ramène tout code inconnu à XX, comme le web', () => {
    expect(normalizeCountryCode(' ne ')).toBe('NE');
    expect(normalizeCountryCode('FR')).toBe(OTHER_COUNTRY_CODE);
    expect(normalizeCountryCode('')).toBeUndefined();
  });

  it('affiche le libellé dans la langue (hausa = français)', () => {
    expect(countryLabel('CI', 'en', 'Other')).toBe('Côte d’Ivoire');
    expect(countryLabel('NG', 'ha', 'Wata ƙasa')).toBe('Nigéria');
    expect(countryLabel('XX', 'fr', 'Autre pays')).toBe('Autre pays');
  });
});

describe('validation', () => {
  it('vérifie l’e-mail après nettoyage', () => {
    expect(validateEmail('  Awa@Example.com ')).toBeNull();
    expect(validateEmail('awa@')).toBe('emailInvalid');
  });

  it('exige 8 caractères et deux mots de passe identiques', () => {
    expect(validateNewPassword('1234567')).toBe('passwordTooShort');
    expect(validateNewPassword('12345678', '12345679')).toBe('passwordsDiffer');
    expect(validateNewPassword('12345678', '12345678')).toBeNull();
  });

  it('nettoie le nom complet', () => {
    expect(cleanFullName('  Awa   Diallo ')).toBe('Awa Diallo');
  });

  it("signale chaque champ manquant de l'inscription", () => {
    expect(validateSignUp({ fullName: ' ', email: 'x', password: '1', country: '' })).toEqual({
      fullName: 'nameRequired',
      email: 'emailInvalid',
      password: 'passwordTooShort',
      country: 'countryRequired',
    });
    expect(
      validateSignUp({ fullName: 'Awa', email: 'awa@example.com', password: '12345678', country: 'SN' }),
    ).toEqual({});
  });
});

describe('erreurs Supabase', () => {
  it('lit le code puis le message', () => {
    expect(mapAuthError({ code: 'invalid_credentials' })).toBe('invalidCredentials');
    expect(mapAuthError({ message: 'Invalid login credentials' })).toBe('invalidCredentials');
    expect(mapAuthError({ code: 'email_not_confirmed' })).toBe('emailNotConfirmed');
    expect(mapAuthError({ code: 'user_already_exists' })).toBe('userExists');
    expect(mapAuthError({ code: 'otp_expired' })).toBe('linkExpired');
    expect(mapAuthError({ status: 429, message: 'x' })).toBe('rateLimited');
    expect(mapAuthError({ name: 'AuthRetryableFetchError', message: 'x' })).toBe('network');
    expect(mapAuthError({ message: 'boom' })).toBe('unknown');
    expect(mapAuthError(null)).toBe('unknown');
  });
});

describe('liens de retour', () => {
  it('extrait le code PKCE', () => {
    expect(parseAuthCallback('karatou://auth/callback?code=abc-123')).toEqual({
      kind: 'code',
      code: 'abc-123',
    });
  });

  it('lit une erreur dans la requête ou dans le fragment', () => {
    expect(
      parseAuthCallback(
        'karatou://auth/callback#error=access_denied&error_code=otp_expired&error_description=Link+expired',
      ),
    ).toEqual({ kind: 'error', code: 'otp_expired', description: 'Link expired' });
    expect(parseAuthCallback('karatou://reset-password?error=server_error')).toEqual({
      kind: 'error',
      code: 'server_error',
      description: '',
    });
  });

  it('ne trouve rien dans un lien nu', () => {
    expect(parseAuthCallback('karatou://auth/callback')).toEqual({ kind: 'none' });
  });

  it('accepte les paramètres déjà extraits par Expo Router', () => {
    expect(parseAuthParams({ code: ['c1', 'c2'] })).toEqual({ kind: 'code', code: 'c1' });
  });
});

describe('fournisseurs activés', () => {
  it('ne retient que google et apple explicitement activés', () => {
    expect(parseEnabledProviders({ external: { email: true, google: true } })).toEqual({
      google: true,
      apple: false,
    });
    expect(parseEnabledProviders({ external: { apple: 'yes' } })).toEqual({ google: false, apple: false });
    expect(parseEnabledProviders(null)).toEqual({ google: false, apple: false });
  });
});
