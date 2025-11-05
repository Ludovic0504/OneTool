// src/pages/AuthCallback.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBrowserSupabase } from "@/lib/supabase/browser-client";

export default function AuthCallback() {
  const navigate = useNavigate();
  const supabase = getBrowserSupabase();
  const [error, setError] = useState(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) throw error;
        console.log("[AuthCallback] Session récupérée :", data);
        navigate("/dashboard", { replace: true });
      } catch (e) {
        console.error("[AuthCallback] Erreur :", e);
        setError(e.message);
      }
    }
    handleCallback();
  }, [supabase, navigate]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-lg font-semibold text-gray-800 mb-2">
          Connexion en cours...
        </h1>
        {error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : (
          <p className="text-gray-500 text-sm">Merci de patienter...</p>
        )}
      </div>
    </div>
  );
}
