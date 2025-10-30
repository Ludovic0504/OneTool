import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
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
  const { signOut } = useAuth();

  // Échap → fermer
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Clic hors panneau → fermer
  useEffect(() => {
    const onClick = (e) => {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Bloque/débloque le scroll body quand le drawer est ouvert
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : prev || "";
    return () => (document.body.style.overflow = prev || "");
  }, [open]);

  async function handleLogout() {
    try {
      await signOut();
    } finally {
      setOpen(false);
      navigate("/login", { replace: true });
    }
  }

  // Composant de lien interne (ferme le drawer au clic)
  const Item = ({ to, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded px-3 py-2 hover:bg-gray-100 ${isActive ? "bg-gray-100 font-medium" : ""}`
      }
      onClick={() => setOpen(false)}
    >
      {children}
    </NavLink>
  );

  return (
    <div className="min-h-dvh bg-white">
      {/* Sidebar fixe desktop */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col border-r bg-white p-4 z-40">
        <div className="mb-4 text-xl font-semibold">OneTool</div>
        <nav className="flex flex-col gap-1">
          {LINKS.map(([href, label]) => (
            <Item key={href} to={href}>{label}</Item>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-auto rounded border px-3 py-2">
          Se déconnecter
        </button>
      </aside>

      {/* Topbar mobile */}
      <div className="md:hidden sticky top-0 z-50 flex items-center justify-between border-b bg-white px-4 py-[calc(12px+env(safe-area-inset-top,0))]">
        <button
          className="rounded border p-2"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
        >
          <Menu size={18} />
        </button>
        <NavLink to="/dashboard" className="text-lg font-semibold" onClick={() => setOpen(false)}>
          OneTool
        </NavLink>
        <button className="rounded border px-3 py-2 text-sm" onClick={handleLogout}>
          Se déconnecter
        </button>
      </div>

      {/* Overlay mobile (clique → ferme) */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/40 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      {/* Drawer mobile */}
      <div
        ref={panelRef}
        className={`md:hidden fixed left-0 top-0 z-50 h-dvh w-72 border-r bg-white p-4 transition-transform
          ${open ? "translate-x-0" : "-translate-x-full"} overflow-y-auto`}
        role="dialog" aria-modal="true"
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
            <Item key={href} to={href}>{label}</Item>
          ))}
        </nav>

        <button className="mt-4 w-full rounded border px-3 py-2" onClick={handleLogout}>
          Se déconnecter
        </button>
      </div>

      {/* Contenu (décalé en desktop) */}
      <main className="px-4 py-6 md:ml-64 md:px-8">{children}</main>
    </div>
  );
}
