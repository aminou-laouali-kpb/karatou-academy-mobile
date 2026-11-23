/** Valeurs acceptées par la contrainte `profiles_gender_check` (et le trigger d'inscription). */
export const GENDERS = ['female', 'male', 'other', 'prefer_not_to_say'] as const;
export type Gender = (typeof GENDERS)[number];

/** Longueur minimale du mot de passe (celle de la page web « nouveau mot de passe »). */
export const MIN_PASSWORD_LENGTH = 8;

/** Clés i18n des erreurs de formulaire, sous `auth.errors`. */
export type FieldError =
  'emailInvalid' | 'passwordTooShort' | 'passwordsDiffer' | 'nameRequired' | 'countryRequired';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): FieldError | null {
  return EMAIL_RE.test(normalizeEmail(email)) ? null : 'emailInvalid';
}

export function validateNewPassword(password: string, confirm?: string): FieldError | null {
  if (password.length < MIN_PASSWORD_LENGTH) return 'passwordTooShort';
  if (confirm !== undefined && confirm !== password) return 'passwordsDiffer';
  return null;
}

/** Espaces multiples réduits : le nom est affiché dans les classements et sur les certificats. */
export function cleanFullName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
  country: string;
  gender?: Gender;
};

export function validateSignUp(input: SignUpInput): Partial<Record<keyof SignUpInput, FieldError>> {
  const errors: Partial<Record<keyof SignUpInput, FieldError>> = {};
  if (cleanFullName(input.fullName).length < 2) errors.fullName = 'nameRequired';
  const emailError = validateEmail(input.email);
  if (emailError) errors.email = emailError;
  const passwordError = validateNewPassword(input.password);
  if (passwordError) errors.password = passwordError;
  if (!input.country) errors.country = 'countryRequired';
  return errors;
}
