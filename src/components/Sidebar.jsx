// src/components/Sidebar.jsx
import { useState } from "react";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop/tablette */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-gray-50 p-4">
        <h2 className="text-xl font-bold mb-4">OneTool</h2>
        <nav className="flex flex-col gap-2">
          <a href="/dashboard" className="hover:underline">Dashboard</a>
          <a href="/prompt" className="hover:underline">Prompt</a>
          <a href="/image" className="hover:underline">Image</a>
          <a href="/video" className="hover:underline">Vidéo</a>
          <a href="/infos" className="hover:underline">À savoir</a>
        </nav>
        <button className="mt-auto border rounded-lg px-3 py-2">Se déconnecter</button>
      </aside>

      <main className="flex-1 relative">
        {/* Burger mobile */}
        <button
          className="md:hidden absolute top-4 left-4 z-50 border rounded-lg p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>

        {/* Drawer mobile */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r p-4 transform transition-transform md:hidden ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="flex flex-col gap-2">
            {[
              ["/dashboard", "Dashboard"],
              ["/prompt", "Prompt"],
              ["/image", "Image"],
              ["/video", "Vidéo"],
              ["/infos", "À savoir"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="rounded px-3 py-2 hover:bg-gray-100" onClick={() => setOpen(false)}>
                {label}
              </a>
            ))}
          </nav>
          <button className="mt-4 border rounded-lg px-3 py-2" onClick={() => setOpen(false)}>
            Se déconnecter
          </button>
        </div>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
