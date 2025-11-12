import { useState } from "react";
import Header from "@/components/Header";
import SidebarShell from "@/components/SidebarShell";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh flex flex-col bg-transparent text-white">
      {/* Header full-bleed (aucun wrapper/padding autour) */}
      <Header onOpenMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />
        <div className="h-12 pointer-events-none bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),rgba(255,255,255,0))]" />

      <div className="flex-1 overflow-hidden">
        <SidebarShell open={menuOpen} onCloseMenu={() => setMenuOpen(false)}>
          <Outlet />
        </SidebarShell>
      </div>
    </div>
  );
}
