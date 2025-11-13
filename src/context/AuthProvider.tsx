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
  // 🔐 Lis le flag posé juste avant le démarrage OAuth pour choisir le storage
  const remember = useMemo(() => {
    try { return localStorage.getItem("onetool_oauth_remember") === "1"; }
    catch { return false; }
  }, []);

  // 👇 Client créé avec le storage cohérent (localStorage si remember=true, sinon sessionStorage)
  const supabase = useMemo(() => getBrowserSupabase({ remember }), [remember]);

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const init = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();
      if (!error) setSession(data.session ?? null);
      setLoading(false);

      if (!mountedRef.current) {
        const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
          setSession(s ?? null);
          setLoading(false);
          // Nettoie le flag une fois loggé (évite des incohérences plus tard)
          if (event === "SIGNED_IN") {
            try { localStorage.removeItem("onetool_oauth_remember"); } catch {}
          }
        });
        unsub = () => sub.subscription.unsubscribe();
        mountedRef.current = true;
      }
    };

    void init();
    return () => { if (unsub) unsub(); };
  }, [supabase]);

  const signOut = async () => {
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
