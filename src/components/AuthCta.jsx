import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import LogoutButton from "./LogoutButton";

export default function AuthCta() {
  const { session, loading } = useAuth();

  // Réserve un espace fixe pour éviter le "saut" de layout pendant le chargement
  return (
    <div className="w-32 flex justify-end">
      {loading ? (
        <span className="text-sm text-gray-400">…</span>
      ) : session ? (
        // Même place, remplace le CTA
        <LogoutButton className="text-sm underline" />
      ) : (
        <Link to="/login" className="text-sm underline">Se connecter</Link>
      )}
    </div>
  );
}
