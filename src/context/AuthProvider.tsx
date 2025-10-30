// src/context/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { type Session } from '@supabase/supabase-js';
import { getBrowserSupabase } from '@/lib/supabase/browser-client';

type AuthCtx = {
  session: Session | null;
  loading: boolean;
  supabase: ReturnType<typeof getBrowserSupabase>;
};

const AuthContext = createContext<AuthCtx | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = useMemo(() => getBrowserSupabase(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // évite de gérer 2x les mêmes events en HMR
  const mountedRef = useRef(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setLoading(false);

      if (!mountedRef.current) {
        const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
          setSession(s ?? null);
        });
        unsub = () => sub.subscription.unsubscribe();
        mountedRef.current = true;
      }
    };

    init();

    return () => {
      if (unsub) unsub();
    };
  }, [supabase]);

  const value = useMemo(() => ({ session, loading, supabase }), [session, loading, supabase]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
