// src/components/Header.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Circle, CircleDot } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

export default function Header({ onOpenMenu }) {
  const { session, loading, signOut } = useAuth();
  const email = session?.user?.email;
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    try { setSigningOut(true); await signOut?.(); }
    finally { setSigningOut(false); }
  }

  return (
    // full-bleed + collé en haut
    <header className="sticky top-0 z-50 w-full border-b border-gray-700 bg-[#0f172a] text-gray-100 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-[#0f172a]/90">
      <div className="pl-[max(8px,env(safe-area-inset-left))] pr-[max(12px,env(safe-area-inset-right))] h-14 flex items-center gap-3">
        {/* Gauche : burger collé + brand */}
        <button
          type="button"
          aria-label="Ouvrir le menu"
          onClick={() => onOpenMenu?.()}
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
        >
          <Menu size={20} />
        </button>

        <div to="/dashboard" className="text-base sm:text-lg font-semibold select-none">
          OneTool
        </div>

        {/* Droite : statut + email + CTA */}
        <div className="ml-auto flex items-center gap-3">
          {/* Statut compact */}
          {loading ? (
            <span className="text-xs text-gray-500">…</span>
          ) : session ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 text-green-400 px-2 py-0.5 text-xs font-medium">
              <CircleDot className="w-3 h-3 text-green-500" />
              Connecté
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-600/30 text-gray-300 px-2 py-0.5 text-xs font-medium">
              <Circle className="w-3 h-3 text-gray-400" />
              Invité
            </span>
          )}

          {/* Email (sm+) */}
          {!loading && email && (
            <span className="hidden sm:block text-sm text-gray-600">{email}</span>
          )}

          {/* CTA plus petit */}
          {loading ? null : session ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={signingOut}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium !bg-red-600 !text-white hover:!bg-red-700 active:!bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm"
            >
              {signingOut ? "Déconnexion…" : "Se déconnecter"}
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-blue-500 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"

            >
              Connexion
            </Link>

          )}
        </div>
      </div>
    </header>
  );
}
