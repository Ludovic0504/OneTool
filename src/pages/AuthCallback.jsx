import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBrowserSupabase } from "@/lib/supabase/browser-client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      // 1) on récupère le client (le remember a été mémorisé côté Login)
      let remember = true;
      try {
        remember = localStorage.getItem("onetool_oauth_remember") === "1";
      } catch {}

      const supabase = getBrowserSupabase({ remember });

      // 2) on laisse Supabase parser l’URL (#access_token ou ?code=...)
      const { data, error } = await supabase.auth.getSessionFromUrl({
        storeSession: true,
      });

      if (error) {
        console.error("OAuth callback error:", error);
        navigate("/login?error=callback", { replace: true });
        return;
      }

      // 3) si on a une session, on redirige vers la page finale
      if (data?.session) {
        let next = "/dashboard";
        try {
          const storedNext = localStorage.getItem("onetool_oauth_next");
          if (storedNext && storedNext.startsWith("/")) {
            next = storedNext;
          }
        } catch {}

        // on nettoie les valeurs temporaires
        try { localStorage.removeItem("onetool_oauth_next"); } catch {}
        try { localStorage.removeItem("onetool_oauth_remember"); } catch {}

        navigate(next, { replace: true });
      } else {
        // pas de session malgré l’OAuth → retour login
        navigate("/login?error=no-session", { replace: true });
      }
    })();
  }, [navigate]);

  return <p className="p-6">Validation en cours…</p>;
}
