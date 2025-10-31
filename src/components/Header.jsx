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
    try {
      setSigningOut(true);
      await signOut(); // appelle le contexte
    } catch (e) {
      // Optionnel: toaster l'erreur
      console.error(e);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-20 bg-white border-b">
      <div className="flex items-center gap-3 px-3 h-14">
        {/* Burger mobile */}
        <button
          type="button"
          className="sm:hidden p-2 rounded hover:bg-gray-100"
          aria-label="Ouvrir le menu"
          onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("onetool:openSidebar")); }}
      >
        <Menu size={20} />
      </button>

        {/* Brand → dashboard */}
        <Link to="/dashboard" className="text-base sm:text-lg font-semibold">
          OneTool
        </Link>

        {/* Zone droite */}
        <div className="ml-auto flex items-center gap-3">
          {/* État */}
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

          {/* CTA unique à droite */}
          <div className="w-32 flex justify-end">
            {loading ? (
              <span className="text-sm text-gray-400">…</span>
            ) : session ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={signingOut}
                className="text-sm underline disabled:opacity-60"
              >
                {signingOut ? "Déconnexion…" : "Se déconnecter"}
              </button>
            ) : (
              <Link to="/login" className="text-sm underline">
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
