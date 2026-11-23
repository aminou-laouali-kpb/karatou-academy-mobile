import { Redirect } from 'expo-router';

import { useAuth } from '@/features/auth/store';

/** Point d'entrée : accueil si connecté, sinon bienvenue (E01). */
export default function Index() {
  const status = useAuth((s) => s.status);
  const recovering = useAuth((s) => s.recovering);
  if (recovering) return <Redirect href="/reset-password" />;
  return <Redirect href={status === 'signedIn' ? '/home' : '/welcome'} />;
}
