import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const LINKS = [
  ["/dashboard", "Dashboard"],
  ["/prompt", "Prompt"],
  ["/image", "Image"],
  ["/video", "Vidéo"],
  ["/a-savoir", "À savoir"],
];

export default function SidebarShell({ children }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const { signOut } = useAuth(); // ← logout SPA, pas de <form action>

  // Fermer avec Échap
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Fermer au clic hors panneau
  useEffect(() => {
    const onClick = (e) => {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Bloquer/débloquer le scroll quand le drawer est ouvert
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : prev || "";
    return () => (document.body.style.overflow = prev || "");
  }, [open]);

  // Logout SPA (corrige l'écran blanc)
  async function handleLogout() {
    try {
      await signOut();
    } finally {
      setOpen(false);
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="min-h-dvh bg-white">
      {/* SIDEBAR FIXE (desktop ≥ md) */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col border-r bg-white p-4">
        <div className="mb-4 text-xl font-semibold">OneTool</div>
        <nav className="flex flex-col gap-1">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} className="rounded px-3 py-2 hover:bg-gray-100">
              {label}
            </a>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto rounded border px-3 py-2"
        >
          Se déconnecter
        </button>
      </aside>

      {/* TOPBAR MOBILE (uniquement < md) */}
      <div className="md:hidden sticky top-0 z-50 flex items-center justify-between border-b bg-white px-4 py-[calc(12px+env(safe-area-inset-top,0))]">
        <button
          className="rounded border p-2"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
        >
          <Menu size={18} />
        </button>
        <a href="/dashboard" className="text-lg font-semibold">OneTool</a>
        <button className="rounded border px-3 py-2 text-sm" onClick={handleLogout}>
          Se déconnecter
        </button>
      </div>

      {/* OVERLAY MOBILE (clique → ferme) */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/40 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      {/* DRAWER MOBILE */}
      <div
        ref={panelRef}
        className={`md:hidden fixed left-0 top-0 z-50 h-dvh w-72 translate-x-0 border-r bg-white p-4 transition-transform overflow-y-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-lg font-semibold">Navigation</span>
          <button
            className="rounded border px-2 py-1"
            onClick={() => setOpen(false)}
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {LINKS.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="rounded px-3 py-2 hover:bg-gray-100"
              onClick={() => setOpen(false)} // ← fermer au clic lien
            >
              {label}
            </a>
          ))}
        </nav>

        <button
          className="mt-4 w-full rounded border px-3 py-2"
          onClick={handleLogout}
        >
          Se déconnecter
        </button>
      </div>

      {/* CONTENU (décalé en desktop) */}
      <main className="px-4 py-6 md:ml-64 md:px-8">{children}</main>
    </div>
  );
}
