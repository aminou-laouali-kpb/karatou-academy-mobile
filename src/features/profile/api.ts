import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/features/auth/store';
import { isLanguage } from '@/i18n';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type Profile = Pick<
  ProfileRow,
  'id' | 'full_name' | 'country' | 'gender' | 'preferred_language' | 'avatar_url'
>;
/** Colonnes que l'apprenant peut modifier (`role` ne l'est pas, fiche §8.2). */
export type ProfileUpdate = Partial<
  Pick<ProfileRow, 'full_name' | 'country' | 'gender' | 'preferred_language'>
>;

export const profileKey = (userId: string | undefined) => ['profile', userId] as const;

export function useProfile() {
  const userId = useAuth((s) => s.session?.user.id);
  return useQuery({
    queryKey: profileKey(userId),
    enabled: Boolean(userId),
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, country, gender, preferred_language, avatar_url')
        .eq('id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateProfile() {
  const userId = useAuth((s) => s.session?.user.id);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: ProfileUpdate) => {
      if (!userId) throw new Error('not signed in');
      const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKey(userId) }),
  });
}

/**
 * Garde `profiles.preferred_language` aligné sur la langue choisie dans l'app,
 * pour que le web et les e-mails parlent la même langue que le mobile.
 */
export function useSyncPreferredLanguage() {
  const { i18n } = useTranslation();
  const { data: profile } = useProfile();
  const { mutate } = useUpdateProfile();
  const language = i18n.language;
  useEffect(() => {
    if (!profile || !isLanguage(language) || profile.preferred_language === language) return;
    mutate({ preferred_language: language });
  }, [profile, language, mutate]);
}
