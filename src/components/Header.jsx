import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Circle, CircleDot } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

export default function Header({ onOpenMenu }) {
  const { session, loading, signOut } = useAuth();
  const email = session?.user?.email;
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    try {
      setSigningOut(true);
      await signOut?.();
    } catch (e) {
      console.error(e);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      {/* barre pleine largeur + safe area + container */}
      <div className="safe-padded mx-auto max-w-screen-xl h-14 flex items-center gap-3">
        {/* Gauche : Burger + Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Ouvrir le menu"
            onClick={(e) => {
              e.stopPropagation();
              onOpenMenu?.();
            }}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 active:bg-gray-100"
          >
            <Menu size={20} />
          </button>

          <Link
            to="/dashboard"
            className="text-base sm:text-lg font-semibold select-none"
          >
            OneTool
          </Link>
        </div>

        {/* Droite : statut + email + CTA */}
        <div className="ml-auto flex items-center gap-3">
          {/* Statut */}
          {loading ? (
            <span className="text-xs text-gray-500">Chargement…</span>
          ) : session ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-700 px-2.5 py-1 text-xs font-medium">
              <CircleDot className="w-3 h-3 text-green-500" />
              Connecté
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 text-gray-700 px-2.5 py-1 text-xs font-medium">
              <Circle className="w-3 h-3 text-gray-400" />
              Invité
            </span>
          )}

          {/* Email (sm+) */}
          {!loading && email && (
            <span className="hidden sm:block text-sm text-gray-600">
              {email}
            </span>
          )}

          {/* CTA */}
          {loading ? (
            <span className="text-sm text-gray-400">…</span>
          ) : session ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={signingOut}
              className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {signingOut ? "Déconnexion…" : "Se déconnecter"}
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-800 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
