import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';

import { normalizeUserRole, type UserRole } from './roles';

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

type AuthState = {
  status: AuthStatus;
  session: Session | null;
  role: UserRole;
  /** Vrai après un lien de réinitialisation : l'écran « nouveau mot de passe » prend la main. */
  recovering: boolean;
  setRecovering: (value: boolean) => void;
};

export const useAuth = create<AuthState>()((set) => ({
  status: 'loading',
  session: null,
  role: 'learner',
  recovering: false,
  setRecovering: (value) => set({ recovering: value }),
}));

function applySession(session: Session | null) {
  useAuth.setState({
    session,
    status: session ? 'signedIn' : 'signedOut',
    // Le rôle vient de app_metadata (JWT), comme sur le web : c'est ce que lit la RLS.
    role: normalizeUserRole(session?.user.app_metadata?.role),
  });
}

let started = false;

/** Lit la session enregistrée puis suit ses changements. À appeler une fois au démarrage. */
export function startAuthListener() {
  if (started) return;
  started = true;
  void supabase.auth.getSession().then(({ data }) => applySession(data.session));
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') useAuth.setState({ recovering: true });
    applySession(session);
  });
}
