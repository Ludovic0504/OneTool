import { useState } from "react";
import Header from "@/components/Header";
import SidebarShell from "@/components/SidebarShell";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh flex flex-col bg-[#f1f5f9]">
      {/* Header full-bleed (aucun wrapper/padding autour) */}
      <Header onOpenMenu={() => setMenuOpen(true)} />

      <div className="flex-1 overflow-hidden">
        <SidebarShell open={menuOpen} onCloseMenu={() => setMenuOpen(false)}>
          <Outlet />
        </SidebarShell>
      </div>
    </div>
  );
}
