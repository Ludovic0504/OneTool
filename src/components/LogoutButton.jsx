import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";

export default function LogoutButton() {
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signOut();
      // On reste sur la même page (mode invité)
      navigate(location.pathname + location.search, { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="rounded px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-60"
    >
      {busy ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
