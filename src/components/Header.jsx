import { Link } from "react-router-dom";
import { Menu, Circle, CircleDot } from "lucide-react";
import LogoutButton from "./LogoutButton";
import { useAuth } from "@/context/AuthProvider";

export default function Header({ onOpenMenu }) {
  const { session, loading } = useAuth();
  const email = session?.user?.email;

  if (loading) {
    // évite les sauts de layout pendant le chargement
    return (
      <header className="sticky top-0 z-20 bg-white border-b">
        <div className="flex items-center gap-3 px-3 h-14">
          <div className="hidden sm:block w-8 h-5 bg-gray-200 rounded" />
          <div className="ml-auto w-48 h-6 bg-gray-200 rounded" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-20 bg-white border-b">
      <div className="flex items-center gap-3 px-3 h-14">
        {/* Burger visible en mobile */}
        <button
          type="button"
          className="sm:hidden p-2 rounded hover:bg-gray-100"
          aria-label="Ouvrir le menu"
          onClick={(e) => { e.stopPropagation(); onOpenMenu?.(); }}
        >
          <Menu size={20} />
        </button>

        {/* Brand → dashboard */}
        <Link to="/dashboard" className="text-base sm:text-lg font-semibold">
          OneTool
        </Link>

        {/* Zone droite : état + actions */}
        <div className="ml-auto flex items-center gap-3">
          {/* Indicateur d'état */}
          {session ? (
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <CircleDot className="w-3 h-3 text-emerald-500" />
              Connecté
            </span>
          ) : (
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Circle className="w-3 h-3 text-gray-400" />
              Invité
            </span>
          )}

          {/* Email (si connecté) */}
          {email && (
            <span className="hidden sm:block text-sm text-gray-600">{email}</span>
          )}

          {/* Action principale */}
          {session ? (
            <LogoutButton />
          ) : (
            <Link to="/login" className="text-sm underline">Se connecter</Link>
          )}
        </div>
      </div>
    </header>
  );
}
