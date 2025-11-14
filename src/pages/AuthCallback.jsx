import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBrowserSupabase } from "@/lib/supabase/browser-client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const url = window.location.href;

      // 1) même logique que dans AuthProvider / Login
      let remember = false;
      try {
        remember = localStorage.getItem("onetool_oauth_remember") === "1";
      } catch {}

      const supabase = getBrowserSupabase({ remember });

      console.log("[AuthCallback] URL =", url);

      // 2) on échange le code OAuth contre une session Supabase
      const { data, error } = await supabase.auth.exchangeCodeForSession(url);

      if (error) {
        console.error("[AuthCallback] Exchange error:", error.message);
        navigate("/login?error=callback", { replace: true });
        return;
      }

      console.log("[AuthCallback] Session:", data);

      // 3) retrouver vers où on devait renvoyer l'utilisateur
      let next = "/dashboard";
      try {
        const saved = localStorage.getItem("onetool_oauth_next");
        if (saved && saved.startsWith("/")) next = saved;
      } catch {}

      navigate(next, { replace: true });
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
