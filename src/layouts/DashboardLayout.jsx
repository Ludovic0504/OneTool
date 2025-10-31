import Header from "@/components/Header";
import SidebarShell from "@/components/SidebarShell";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <SidebarShell>
        <Outlet />
      </SidebarShell>
    </div>
  );
}
