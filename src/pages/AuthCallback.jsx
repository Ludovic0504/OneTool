import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBrowserSupabase } from "@/lib/supabase/browser-client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const supabase = getBrowserSupabase();

      console.log("[AuthCallback] URL =", window.location.href);

      // ❗ Nouvelle méthode : supabase.auth.exchangeCodeForSession()
      const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);

      if (error) {
        console.error("[AuthCallback] Exchange error:", error.message);
        navigate("/login?error=callback", { replace: true });
        return;
      }

      console.log("[AuthCallback] Session:", data);

      // Lire la redirection prévue
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
