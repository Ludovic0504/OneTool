import { useState } from "react";
import Header from "@/components/Header";
import SidebarShell from "@/components/SidebarShell";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    // 1) dvh au lieu de h-screen + layout colonne robuste
    <div className="min-h-dvh flex flex-col bg-[#f1f5f9] text-gray-800">

      {/* 2) Header hors flux de scroll + safe-area */}
      <div className="safe-padded shrink-0">
        <Header onOpenMenu={() => setMenuOpen(true)} />
      </div>

      {/* 3) Shell = zone qui grandit et gère le scroll */}
      <div className="flex-1 overflow-hidden">
        <SidebarShell
          open={menuOpen}
          onCloseMenu={() => setMenuOpen(false)}
        >
          {/* 4) Contenu scrollable + safe-area */}
          <main className="safe-padded h-full overflow-y-auto">
            <Outlet />
          </main>
        </SidebarShell>
      </div>
    </div>
  );
}
