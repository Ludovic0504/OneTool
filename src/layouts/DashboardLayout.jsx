import { useState } from "react";
import Header from "@/components/Header";
import SidebarShell from "@/components/SidebarShell";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh flex flex-col bg-transparent text-white">
      <Header onOpenMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />

      {/* ---- contenu flouté quand le menu est ouvert ---- */}
      <div className="flex-1 overflow-hidden transition">
        <SidebarShell open={menuOpen} onCloseMenu={() => setMenuOpen(false)}>
          <Outlet />
        </SidebarShell>
      </div>
    </div>
  );
}
