import Header from "@/components/Header";
import SidebarShell from "@/components/SidebarShell";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen">
      <Header />
      <SidebarShell>
        {/* Ici, l’outlet ou les pages */}
      </SidebarShell>
    </div>
  );
}
