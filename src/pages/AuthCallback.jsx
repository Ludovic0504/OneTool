import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBrowserSupabase } from "@/lib/supabase/browser-client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      console.log("[AuthCallback] mounted, href =", window.location.href);

      // 1) récupérer le remember stocké par la page Login
      let remember = true;
      try {
        remember = localStorage.getItem("onetool_oauth_remember") === "1";
      } catch {}

      const supabase = getBrowserSupabase({ remember });

      const hash = window.location.hash || "";
      const search = window.location.search || "";

      try {
        // 2) Si on a un token dans l'URL → Supabase le parse et stocke la session
        if (hash.includes("access_token") || search.includes("code=")) {
          console.log("[AuthCallback] found token/code in URL, calling getSessionFromUrl...");
          const { data, error } = await supabase.auth.getSessionFromUrl({
            storeSession: true,
          });
          console.log("[AuthCallback] getSessionFromUrl →", { data, error });

          if (error) {
            console.error("[AuthCallback] error after getSessionFromUrl:", error);
            navigate("/login?error=callback", { replace: true });
            return;
          }
        } else {
          console.log("[AuthCallback] no token in URL, skipping getSessionFromUrl()");
        }

        // 3) À ce stade, Supabase a eu l'occasion de stocker la session.
        const { data: sessionData, error: sError } = await supabase.auth.getSession();
        console.log("[AuthCallback] getSession →", { sessionData, sError });

        if (sError) {
          console.error("[AuthCallback] getSession error:", sError);
        }

        if (sessionData?.session) {
          // 4) on calcule la page de destination
          let next = "/dashboard";
          try {
            const storedNext = localStorage.getItem("onetool_oauth_next");
            if (storedNext && storedNext.startsWith("/")) {
              next = storedNext;
            }
          } catch {}

          // nettoyage
          try {
            localStorage.removeItem("onetool_oauth_next");
            localStorage.removeItem("onetool_oauth_remember");
          } catch {}

          console.log("[AuthCallback] session OK → redirect to", next);
          navigate(next, { replace: true });
        } else {
          console.warn("[AuthCallback] no session after callback, redirect to login");
          navigate("/login?error=no-session", { replace: true });
        }
      } catch (e) {
        console.error("[AuthCallback] fatal error:", e);
        navigate("/login?error=callback", { replace: true });
      }
    })();
  }, [navigate]);

  return <p className="p-6">Validation en cours…</p>;
}
