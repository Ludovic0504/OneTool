import { useEffect, useState } from 'react';
import { supabase } from './client';

export function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);   // vrai tant que la 1re vérif n'est pas finie

  useEffect(() => {
    let mounted = true;
    let minDelay = setTimeout(() => {}, 0); // on fixera ci-dessous

    // 1) lecture initiale
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      // on garde un léger délai pour éviter un flash du loader (200ms min)
      minDelay = setTimeout(() => setLoading(false), 200);
    });

    // 2) écoute des changements
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s ?? null);
    });

    return () => {
      mounted = false;
      clearTimeout(minDelay);
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
