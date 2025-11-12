// src/components/SidebarShell.jsx
import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";

const links = [
  ["/lab", "Beta Lab"],
  ["/prompt", "Prompts"],
  ["/image", "Images"],
  ["/video", "Vidéos"],
  ["/a-savoir", "À savoir"],
];

export default function SidebarShell({ children, open, onCloseMenu }) {
  const panelRef = useRef(null);
  const location = useLocation();

  // Ferme le drawer à la nav
  useEffect(() => { if (open) onCloseMenu?.(); }, [location.pathname]);

  // Ferme au clic extérieur
  useEffect(() => {
    const onDown = (e) => {
      if (!open) return;
      const p = panelRef.current;
      if (p && !p.contains(e.target)) onCloseMenu?.();
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [open, onCloseMenu]);

  const Item = ({ to, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded-md px-3 py-2 text-sm transition
         ${isActive ? "bg-white/10 text-white" : "text-slate-200 hover:bg-white/5 hover:text-white"}`
      }
    >
      {label}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-transparent flex">
      {/* ---- Sidebar desktop ---- */}
      <aside className="relative hidden md:block w-60 bg-transparent">
        <nav className="flex flex-col gap-1 px-3 pt-4 text-white">
          {links.map(([to, label]) => (
            <Item key={to} to={to} label={label} />
          ))}
        </nav>
      </aside>

      {/* ---- Overlay mobile (floute le fond, PAS la sidebar) ---- */}
      {open && (
        <div
          className="fixed inset-0 z-40
                     bg-black/50 supports-[backdrop-filter]:bg-black/30
                     backdrop-blur-2xl"
          style={{
            WebkitBackdropFilter: "blur(24px)",
            clipPath: "inset(64px 0 0 0)" // 64px = h-16, on épargne la zone du header
          }}
          onMouseDown={() => onCloseMenu?.()}
          onTouchStart={() => onCloseMenu?.()}
          aria-hidden
        />
      )}

      {/* ---- Drawer mobile (NET, au-dessus de l’overlay) ---- */}
      <aside
        ref={panelRef}
        className={`fixed inset-y-0 left-0 w-64 z-50
                    transform transition-transform duration-200 md:hidden
                    ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-hidden={!open}
      >
        <div className="h-full bg-[#0C1116]/95 text-white shadow-xl">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <span className="font-medium">Navigation</span>
            <button
              onClick={() => onCloseMenu?.()}
              className="text-gray-300 hover:text-white text-xl"
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-3 py-3">
            {links.map(([to, label]) => (
              <Item key={to} to={to} label={label} />
            ))}
          </nav>
        </div>
      </aside>

      {/* ---- Contenu ---- */}
      <main className="flex-1 min-h-screen">
        <div className="pt-3 pb-4 pl-[max(8px,env(safe-area-inset-left))] pr-[max(8px,env(safe-area-inset-right))] sm:px-3 md:px-4">
          {children}
        </div>
      </main>
    </div>
  );
}
