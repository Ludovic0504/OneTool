import { useState } from "react";
import Header from "@/components/Header";
import SidebarShell from "@/components/SidebarShell";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header onOpenMenu={() => setMenuOpen(true)} />
      <SidebarShell open={menuOpen} onCloseMenu={() => setMenuOpen(false)}>
        <Outlet />
      </SidebarShell>
    </div>
  );
}
