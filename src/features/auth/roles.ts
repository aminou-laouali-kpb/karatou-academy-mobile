/**
 * Rôles, alignés sur la web app (`src/lib/roles.ts` du repo web).
 * Le rôle fait foi dans `app_metadata.role` du JWT (lu par la RLS) ;
 * `profiles.role` n'est qu'une donnée d'affichage.
 */
export type UserRole = 'learner' | 'enterprise_admin' | 'platform_admin';

export function normalizeUserRole(value: unknown): UserRole {
  const role = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (role === 'platform_admin' || role === 'admin') return 'platform_admin';
  if (role === 'enterprise_admin' || role === 'org_admin') return 'enterprise_admin';
  return 'learner';
}

export function isAdminRole(role: UserRole): boolean {
  return role !== 'learner';
}

/**
 * L'app mobile est réservée à l'expérience apprenant (fiche §8.2).
 * Un compte admin y apprend comme tout le monde, avec un lien vers son espace web.
 */
export function webAdminPath(role: UserRole): string | null {
  switch (role) {
    case 'platform_admin':
      return '/admin';
    case 'enterprise_admin':
      return '/enterprise';
    default:
      return null;
  }
}
