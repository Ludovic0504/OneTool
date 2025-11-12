import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const links = [
  ["/lab", "Beta Lab", "mt-6"],
  ["/prompt", "Prompt"],
  ["/image", "Image"],
  ["/video", "Vidéo"],
  ["/a-savoir", "A savoir"],
];

export default function SidebarShell({ children, open, onCloseMenu }) {
  const panelRef = useRef(null);
  const location = useLocation();
  const [openedAt, setOpenedAt] = useState(0);

  useEffect(() => { if (open) setOpenedAt(Date.now()); }, [open]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCloseMenu?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCloseMenu]);
  useEffect(() => {
    const onPointerDown = (e) => {
      if (!open) return;
      if (Date.now() - openedAt < 250) return;
      const panel = panelRef.current;
      if (panel && !panel.contains(e.target)) onCloseMenu?.();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, openedAt, onCloseMenu]);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : prev || "";
    return () => { document.body.style.overflow = prev || ""; };
  }, [open]);
  useEffect(() => { if (open) onCloseMenu?.(); }, [location.pathname, location.search]); // ferme sur navigation

  const Item = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `rounded-lg px-3 py-2 text-slate-300 transition
       hover:bg-white/5 hover:text-white
       ${isActive ? "bg-white/[0.06] text-white ring-1 ring-white/10" : ""}`
    }
    onClick={() => onCloseMenu?.()}
  >
    {children}
  </NavLink>
);


  return (
    <div className="min-h-screen bg-transparent flex">
      {/* Sidebar desktop immersive */}
      <aside className="relative hidden md:block w-60 bg-transparent">
        <nav className="flex flex-col gap-1 px-3 pt-4">
          {links.map(([to, label]) => (
            <Item key={to} to={to}>{label}</Item>
          ))}
        </nav>
        {/* halo en bas */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none
                        bg-[radial-gradient(120px_40px_at_50%_120%,color-mix(in_oklab,var(--accent)_30%,transparent),transparent)]" />
      </aside>

      {/* Overlay + Drawer mobile */}
      {open && (
  <div
    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-2xl supports-[backdrop-filter]:bg-black/30"
    style={{
      WebkitBackdropFilter: "blur(24px)", // compatibilité iOS
      clipPath: "inset(64px 0 0 0)"       // exclut la zone du header (64px = h-16)
    }}
    onMouseDown={() => onCloseMenu?.()}
    onTouchStart={() => onCloseMenu?.()}
    aria-hidden
  />
)}

      <aside
        ref={panelRef}
         className={`fixed inset-y-0 left-0 w-64 bg-transparent transform transition-transform duration-200 z-50 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <span className="font-medium">Navigation</span>
          <button onClick={() => onCloseMenu?.()} className="text-gray-400 hover:text-white text-xl" aria-label="Fermer le menu">×</button>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-3">
          {links.map(([to, label]) => (
            <Item key={to} to={to}>{label}</Item>
          ))}
        </nav>
      </aside>

      {/* Contenu */}
      <main className="flex-1 min-h-screen">
        <div className="pt-3 pb-4 pl-[max(8px,env(safe-area-inset-left))] pr-[max(8px,env(safe-area-inset-right))] sm:px-3 md:px-4">
          {children}
        </div>
      </main>
    </div>
  );
}
