import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Circle, CircleDot } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

export default function Header({ onOpenMenu, menuOpen }) {
  const { session, loading, signOut } = useAuth();
  const email = session?.user?.email;
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    try {
      setSigningOut(true);
      await signOut?.();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header
  className={`sticky top-0 z-50 w-full text-gray-100 transition-all duration-300 ${
    menuOpen
      ? "backdrop-blur-lg supports-[backdrop-filter]:bg-[#0C1116]/70 bg-[#0C1116]/80"
      : "bg-transparent"
  }`}
>

      {/* barre */}
      <div className="pl-[max(8px,env(safe-area-inset-left))] pr-[max(12px,env(safe-area-inset-right))] h-16 flex items-center gap-3">
        {/* burger */}
        <button
          type="button"
          aria-label="Ouvrir le menu"
          onClick={() => onOpenMenu?.()}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 hover:bg-white/5 active:bg-white/10"
        >
          <Menu size={20} />
        </button>

        {/* marque + petit sigil lumineux */}
        <Link to="/dashboard" className="group select-none inline-flex items-center gap-2">
          <span className="relative grid place-items-center h-6 w-6 rounded-full">
            <span className="absolute inset-0 rounded-full bg-[radial-gradient(closest-side,theme(colors.emerald.400),transparent)] opacity-70 blur-[2px]" />
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_2px_theme(colors.emerald.400)]" />
          </span>
          <span className="text-base sm:text-lg font-semibold tracking-wide">OneTool</span>
        </Link>

        {/* droite */}
        <div className="ml-auto flex items-center gap-3">
          {loading ? (
            <span className="text-xs text-gray-400">…</span>
          ) : session ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-300 px-2 py-0.5 text-xs font-medium">
              <CircleDot className="w-3 h-3 text-emerald-400" /> Connecté
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 text-gray-300 px-2 py-0.5 text-xs font-medium">
              <Circle className="w-3 h-3 text-gray-400" /> Invité
            </span>
          )}

          {!loading && email && <span className="hidden sm:block text-sm text-gray-400">{email}</span>}

          {loading ? null : session ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={signingOut}
              className="inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 active:bg-red-800 disabled:opacity-50"
            >
              {signingOut ? "Déconnexion…" : "Se déconnecter"}
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-black hover:bg-emerald-400 active:bg-emerald-600"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
