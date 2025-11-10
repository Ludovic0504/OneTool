import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getBrowserSupabase } from "@/lib/supabase/browser-client";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    (async () => {
      const supabase = getBrowserSupabase();

      // Essaye d’échanger le code de confirmation contre une session
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

      if (error) {
        console.error("Erreur d’échange de code :", error);
        navigate("/login?error=callback", { replace: true });
        return;
      }

      const params = new URLSearchParams(location.search);
      const type = params.get("type"); // "signup" | "recovery" | "magiclink" | "oauth" | null

      if (type === "signup") {
        // Pour forcer la confirmation manuelle après inscription
        await supabase.auth.signOut();
        navigate("/login?confirmed=1", { replace: true });
      } else {
        // Autres cas : lien magique, recovery, OAuth
        navigate("/dashboard", { replace: true });
      }
    })();
  }, [location.search, navigate]);

  return <p className="p-6">Validation en cours…</p>;
}
