import { useState } from "react";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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

      {/* Contenu principal */}
      <main className="flex-1 relative">
        {/* Bouton burger visible uniquement sur mobile */}
        <button
          className="md:hidden absolute top-4 left-4 z-50 border rounded-lg p-2"
          onClick={() => setOpen((v) => !v)}
        >
          <Menu size={20} />
        </button>

        {/* Menu mobile (slide in/out) */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r p-4 transform transition-transform md:hidden ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="flex flex-col gap-2">
            <a href="/dashboard" className="hover:underline" onClick={() => setOpen(false)}>Dashboard</a>
            <a href="/prompt" className="hover:underline" onClick={() => setOpen(false)}>Prompt</a>
            <a href="/image" className="hover:underline" onClick={() => setOpen(false)}>Image</a>
            <a href="/video" className="hover:underline" onClick={() => setOpen(false)}>Vidéo</a>
            <a href="/infos" className="hover:underline" onClick={() => setOpen(false)}>À savoir</a>
          </nav>
          <button
            className="mt-auto border rounded-lg px-3 py-2"
            onClick={() => setOpen(false)}
          >
            Se déconnecter
          </button>
        </div>

        {/* Ton contenu dashboard */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
