// src/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Prompt from "./pages/Prompt";
import ImagePage from "./pages/Image";
import VideoPage from "./pages/Video";
import Asavoir from "./pages/Asavoir";
import Login from "./pages/Login";
import LogoutRoute from "./pages/LogoutRoute";

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

export default function App() {
  return (
    <Routes>
      {/* index -> dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* pages publiques hors layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<LogoutRoute />} />

      {/* pages sous layout (publiques) */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/prompt" element={<Prompt />} />
        <Route path="/image" element={<ImagePage />} />
        <Route path="/video" element={<VideoPage />} />
        <Route path="/a-savoir" element={<Asavoir />} />
      </Route>

      {/* wildcard en dernier */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
