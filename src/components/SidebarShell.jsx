import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const links = [
  ["/dashboard", "Dashboard"],
  ["/prompt", "Prompts"],
  ["/image", "Images"],
  ["/video", "Vidéos"],
  ["/a-savoir", "A savoir"],
];

export default function SidebarShell({ children, open, onCloseMenu }) {
  const panelRef = useRef(null);
  const location = useLocation();
  const [openedAt, setOpenedAt] = useState(0); // grace period anti-fermeture immédiate

  // Quand on ouvre, on mémorise l’instant d’ouverture
  useEffect(() => {
    if (open) setOpenedAt(Date.now());
  }, [open]);

  // Fermer avec Échap
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCloseMenu?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCloseMenu]);

  // Fermer en cliquant à l’extérieur (mobile friendly)
  useEffect(() => {
    const onPointerDown = (e) => {
      if (!open) return;
      if (Date.now() - openedAt < 250) return; // fenêtre de grâce
      const panel = panelRef.current;
      if (!panel) return;
      const clickedInside = panel.contains(e.target);
      if (!clickedInside) onCloseMenu?.();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, openedAt, onCloseMenu]);

  // Bloquer le scroll du body quand le drawer est ouvert
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [open]);

  // Fermer lors d’un changement de route
  useEffect(() => {
    if (open) onCloseMenu?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  // Lien qui ferme le drawer
  const Item = ({ to, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded px-3 py-2 hover:bg-gray-100 ${isActive ? "bg-gray-100 font-medium" : ""}`
      }
      onClick={() => onCloseMenu?.()}
    >
      {children}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar desktop*/}
      <aside className="hidden md:block w-60 border-r bg-white">
        <nav className="flex flex-col gap-1 px-3">
          {links.map(([to, label]) => (
            <Item key={to} to={to}>{label}</Item>
          ))}
        </nav>
      </aside>

      {/* Overlay + Drawer mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm md:hidden z-40"
          onMouseDown={() => onCloseMenu?.()}
          onTouchStart={() => onCloseMenu?.()}
        />
      )}

      <aside
        ref={panelRef}
        className={`fixed inset-y-0 left-0 w-60 bg-white border-r transform transition-transform duration-200 z-50 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {/*<span className="font-semibold text-lg">OneTool</span>*/}
          <button
            onClick={() => onCloseMenu?.()}
            className="text-gray-500 hover:text-gray-700 text-xl"
            aria-label="Fermer le menu"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-3">
          {links.map(([to, label]) => (
            <Item key={to} to={to}>{label}</Item>
          ))}
        </nav>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 min-h-screen">
        <div className="pt-2 pb-3 pl-[max(8px,env(safe-area-inset-left))] pr-[max(8px,env(safe-area-inset-right))] sm:px-3 md:px-4">
          {children}
        </div>
      </main>
    </div>
  );
}
