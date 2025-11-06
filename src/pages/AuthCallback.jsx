import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getBrowserSupabase } from "@/lib/supabase/browser-client";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    (async () => {
      const supabase = getBrowserSupabase();
      const params = new URLSearchParams(location.search);
      const type = params.get("type"); // "signup" | "recovery" | "magiclink" | null

      const { error } = await supabase.auth.exchangeCodeForSession();
      if (error) {
        navigate("/login?error=callback", { replace: true });
        return;
      }

      if (type === "signup") {
        // On veut forcer l'UX "confirmer puis se connecter manuellement"
        await supabase.auth.signOut();
        navigate("/login?confirmed=1", { replace: true });
      } else {
        // Cas magic link / recovery / OAuth
        navigate("/dashboard", { replace: true });
      }
    })();
  }, [location.search, navigate]);

  return <p className="p-6">Validation en cours…</p>;
}
