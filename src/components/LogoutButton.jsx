import { useState } from "react";
import { supabase } from "../supabase/client";

export default function LogoutButton() {
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      console.log("[Logout] click");             // debug: doit apparaître en console
      await supabase.auth.signOut({ scope: "global" });
      // Purge locale éventuelle
      // ["onboarding-state"].forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error("[Logout] signOut error:", e);
      // on continue quand même vers /dashboard
    } finally {
      setBusy(false);
      // ⚠️ navigation forcée (bypass react-router si besoin)
      window.location.assign("/dashboard");
    }
  };

  return (
    <button type="button" onClick={handleLogout} disabled={busy} aria-busy={busy}>
      Se déconnecter
    </button>
  );
}
