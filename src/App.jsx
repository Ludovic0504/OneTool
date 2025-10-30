// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";     // 👈 garde ce fichier ici
import DashboardLayout from "./layouts/DashboardLayout.jsx";  // 👈 rend <SidebarShell><Outlet/></SidebarShell>

import Dashboard from "./pages/Dashboard.jsx";
import Prompt from "./pages/Prompt.jsx";
import ImagePage from "./pages/Image.jsx";
import VideoPage from "./pages/Video.jsx";
import Asavoir from "./pages/Asavoir.jsx";

import Login from "./pages/Login.jsx";
import LogoutRoute from "./pages/LogoutRoute.jsx";

export default function App() {
  return (
    <Routes>
      {/* index -> dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* pages publiques (pas de sidebar) */}
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<LogoutRoute />} />

      {/* Toutes les pages privées du dashboard : guard + layout (sidebar/burger) */}
    <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/prompt" element={<Prompt />} />
      <Route path="/image" element={<ImagePage />} />
      <Route path="/video" element={<VideoPage />} />
      <Route path="/a-savoir" element={<Asavoir />} />
    </Route>


      {/* fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
