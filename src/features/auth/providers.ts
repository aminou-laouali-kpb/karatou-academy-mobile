import { useQuery } from '@tanstack/react-query';

import { env } from '@/lib/env';

export type EnabledProviders = { google: boolean; apple: boolean };

/** Lit `external` dans la réponse publique `/auth/v1/settings` de Supabase Auth. Fonction pure, testée. */
export function parseEnabledProviders(settings: unknown): EnabledProviders {
  const external = (settings as { external?: Record<string, unknown> } | null)?.external ?? {};
  return { google: external.google === true, apple: external.apple === true };
}

/**
 * Fournisseurs sociaux réellement activés côté Supabase (tâche B6 de la fiche).
 * On n'affiche que ceux-là : un bouton Google qui échoue serait pire que pas de bouton.
 * Mis en cache 24 h ; hors ligne, on n'affiche rien plutôt que des boutons inutilisables.
 */
export function useEnabledProviders() {
  return useQuery({
    queryKey: ['auth', 'providers'],
    staleTime: 24 * 60 * 60 * 1000,
    queryFn: async (): Promise<EnabledProviders> => {
      const response = await fetch(`${env.supabaseUrl}/auth/v1/settings`, {
        headers: { apikey: env.supabaseAnonKey },
      });
      if (!response.ok) throw new Error(`auth settings ${response.status}`);
      return parseEnabledProviders(await response.json());
    },
  });
}
