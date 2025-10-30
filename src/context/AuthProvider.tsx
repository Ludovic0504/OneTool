'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import supabase from '../supabase/client';
import type { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithPassword: (args: { email: string; password: string }) => Promise<{ error: Error | null }>;
  signInWithOtp: (args: { email: string; redirectTo?: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signInWithPassword: async () => ({ error: null }),
  signInWithOtp: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1) lecture initiale
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    // 2) écoute des changements
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!mounted) return;
      setSession(sess ?? null);
      setLoading(false); // ← assure qu’on quitte le loading même si getSession traîne
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Helpers
  const signInWithPassword: AuthContextType['signInWithPassword'] = async ({ email, password }) =>
    supabase.auth.signInWithPassword({ email, password });

  const signInWithOtp: AuthContextType['signInWithOtp'] = async ({ email, redirectTo }) =>
    supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });

  const signOut: AuthContextType['signOut'] = async () => supabase.auth.signOut();

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signInWithPassword,
      signInWithOtp,
      signOut,
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
