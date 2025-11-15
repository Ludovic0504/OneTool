// src/pages/AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBrowserSupabase } from "@/lib/supabase/browser-client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const url = window.location.href;
      console.log("[AuthCallback] start, url =", url);

      // 1) Même logique que le reste de l'app pour le storage (remember)
      let remember = false;
      try {
        remember = localStorage.getItem("onetool_oauth_remember") === "1";
      } catch (e) {
        console.warn("[AuthCallback] cannot read remember flag:", e);
      }

      const supabase = getBrowserSupabase({ remember });

      try {
        // 2) On tente l’échange code ↔ session
        const { data, error } = await supabase.auth.exchangeCodeForSession(url);
        console.log("[AuthCallback] exchange result:", { data, error });

        // 3) On vérifie s'il y a une session active, même si 'error' est défini
        const { data: sessionData } = await supabase.auth.getSession();
        const hasSession = !!(sessionData?.session || data?.session);

        if (!hasSession) {
          console.error("[AuthCallback] no session after exchange, redirecting to /login");
          navigate("/login?error=callback", { replace: true });
          return;
        }

        // 4) Retrouver la route de redirection (next)
        let next = "/dashboard";
        try {
          const savedNext = localStorage.getItem("onetool_oauth_next");
          if (savedNext && savedNext.startsWith("/")) {
            next = savedNext;
          }
        } catch (e) {
          console.warn("[AuthCallback] cannot read next from storage:", e);
        }

        console.log("[AuthCallback] success, redirecting to", next);
        navigate(next, { replace: true });
      } catch (err) {
        console.error("[AuthCallback] unexpected error:", err);
        navigate("/login?error=callback", { replace: true });
      }
    })();
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center text-white"
      style={{ background: "#0C1116" }}
    >
      Validation en cours…
    </div>
  );
}
