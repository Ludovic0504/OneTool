import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBrowserSupabase } from "@/lib/supabase/browser-client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const supabase = getBrowserSupabase();
      const { error } = await supabase.auth.exchangeCodeForSession();
      if (error) navigate("/login?error=callback", { replace: true });
      else navigate("/dashboard", { replace: true }); // ou /onboarding
    })();
  }, [navigate]);

  return <p className="p-6">Connexion en cours…</p>;
}
