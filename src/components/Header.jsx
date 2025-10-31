import { Link } from "react-router-dom";
import { Menu, Circle, CircleDot } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import AuthCta from "./AuthCta";

export default function Header({ onOpenMenu }) {
  const { session, loading } = useAuth();
  const email = session?.user?.email;

  return (
    <header className="sticky top-0 z-20 bg-white border-b">
      <div className="flex items-center gap-3 px-3 h-14">
        <button
          type="button"
          className="sm:hidden p-2 rounded hover:bg-gray-100"
          aria-label="Ouvrir le menu"
          onClick={(e) => { e.stopPropagation(); onOpenMenu?.(); }}
        >
          <Menu size={20} />
        </button>

        <Link to="/dashboard" className="text-base sm:text-lg font-semibold">
          OneTool
        </Link>

        <div className="ml-auto flex items-center gap-3">
          {/* Indicateur d’état */}
          {loading ? (
            <span className="text-sm text-gray-400">Chargement…</span>
          ) : session ? (
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

          {/* Email si connecté */}
          {!loading && email && (
            <span className="hidden sm:block text-sm text-gray-600">{email}</span>
          )}

          {/* CTA fixe (se connecte / se déconnecter au même endroit) */}
          <AuthCta />
        </div>
      </div>
    </header>
  );
}
