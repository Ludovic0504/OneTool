import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client"; // ton client partagé
import { useState } from "react";

export default function LogoutButton() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
  if (busy) return;
  setBusy(true);
  try {
    // Déconnexion globale Supabase
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) throw error;

    // Purge locale (optionnel)
    localStorage.removeItem("onboarding-state");

    // Redirection vers le dashboard
    navigate("/dashboard", { replace: true }); // 👈 au lieu de /login
  } catch (e) {
    console.error("Erreur de déconnexion :", e);
  } finally {
    setBusy(false);
  }
};


  return (
    <button onClick={handleLogout} disabled={busy} aria-busy={busy}>
      Se déconnecter
    </button>
  );
}
