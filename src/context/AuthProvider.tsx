import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabase/browser-client";

type AuthCtx = {
  session: Session | null;
  loading: boolean;
  supabase: SupabaseClient;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = useMemo(() => getBrowserSupabase(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
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

    void init();
    return () => {
      if (unsub) unsub();
    };
  }, [supabase]);

  const signOut = async () => {
    // Déconnexion propre + mise à jour immédiate de l’état local
    await supabase.auth.signOut();
    setSession(null);
  };

  const value = useMemo(
    () => ({ session, loading, supabase, signOut }),
    [session, loading, supabase]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
