import { useState } from "react";
import Header from "@/components/Header";
import SidebarShell from "@/components/SidebarShell";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  <div className="min-h-dvh flex flex-col bg-[#f1f5f9]">
  {/* Header collé au bord */}
  <Header onOpenMenu={() => setMenuOpen(true)} />

  {/* Contenu plein écran sans marges */}
  <div className="flex-1 overflow-hidden">
    <SidebarShell open={menuOpen} onCloseMenu={() => setMenuOpen(false)}>
      <main className="h-full overflow-y-auto">
        <Outlet />
      </main>
    </SidebarShell>
  </div>
</div>
}
