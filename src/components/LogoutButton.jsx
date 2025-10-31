import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getBrowserSupabase } from "@/lib/supabase/browser-client";
import { useAuth } from "@/context/AuthProvider";

/**
 * Bouton de déconnexion très robuste.
 * - Appelle signOut() du contexte si dispo, sinon fallback direct Supabase.
 * - Nettoie les tokens locaux au cas où.
 * - Redirige proprement (vers /login par défaut) et peut déclencher un callback.
 */
export default function LogoutButton({ className = "", to = "/login", onAfter }) {
  const ctx = useAuth(); // { signOut?, supabase?, ... }
  const supabase = getBrowserSupabase();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);

  const clearLocalTokens = () => {
    try {
      // Supprime les tokens Supabase si jamais ils traînent
      Object.keys(localStorage)
        .filter((k) => k.startsWith("sb-") || k.includes("supabase"))
        .forEach((k) => localStorage.removeItem(k));
    } catch {}
  };

  const handleLogout = async () => {
    if (busy) return;
    setBusy(true);

    try {
      // 1) essayer via le contexte (si exposé)
      if (ctx?.signOut) {
        await ctx.signOut();
      } else {
        // 2) fallback direct
        await supabase.auth.signOut();
      }
    } catch (e) {
      // on continue quand même, pour forcer un état invité
      // console.warn("signOut error:", e);
    } finally {
      clearLocalTokens();
      // callback optionnel (ex: fermer drawer)
      if (onAfter) {
        try { onAfter(); } catch {}
      }
      // Navigation : par défaut on va sur /login.
      // Si tu veux rester sur place en mode invité, remplace la ligne suivante par:
      // navigate(location.pathname + location.search, { replace: true });
      navigate(to || "/login", { replace: true });
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={busy}
      className={
        "rounded px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-60 " +
        className
      }
    >
      {busy ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
