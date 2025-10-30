import SidebarShell from "../components/SidebarShell.jsx";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <SidebarShell>
      <Outlet />
    </SidebarShell>
  );
}
