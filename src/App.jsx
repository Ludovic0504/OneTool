import { useState, useEffect } from "react";
// (tes autres imports restent identiques)

function AppLayout() {
  const [open, setOpen] = useState(false);

  // Empêche le scroll quand le drawer est ouvert sur mobile
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar desktop */}
      <aside className="hidden md:block fixed inset-y-0 left-0 w-60 border-r bg-white">
        <Sidebar onNavigate={() => {}} />
      </aside>

      {/* Drawer mobile */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white shadow-md md:hidden">
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </>
      )}

      {/* Contenu */}
      <div className="md:ml-60 flex flex-col min-h-screen">
        <Header onOpenMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
