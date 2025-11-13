import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBrowserSupabase } from "@/lib/supabase/browser-client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const supabase = getBrowserSupabase({ remember: true });

      // Récupération du token depuis URL
      const { data, error } = await supabase.auth.getSessionFromUrl({
        storeSession: true,
      });

      if (error) {
        console.error("OAuth error:", error);
        navigate("/login?error=callback", { replace: true });
        return;
      }

      if (data?.session) {
        // Redirection finale
        const next = localStorage.getItem("onetool_oauth_next") || "/dashboard";
        try { localStorage.removeItem("onetool_oauth_next"); } catch {}
        try { localStorage.removeItem("onetool_oauth_remember"); } catch {}

        navigate(next, { replace: true });
      } else {
        navigate("/login?error=no-session", { replace: true });
      }
    })();
  }, []);

  return (
    <p className="p-6">Validation en cours…</p>
  );
}
