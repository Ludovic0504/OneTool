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
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw error;

      // Optionnel : purge de caches/stores ici (queryClient.clear(), etc.)
      navigate("/login", { replace: true });
    } catch (e) {
      console.error("Erreur de déconnexion :", e);
      // TODO: toast/alert si besoin
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
