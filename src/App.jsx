import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Sidebar from "./components/Sidebar.jsx";
// (d'autres pages si besoin)
import Prompt from "./pages/Prompt.jsx";
import Video from "./pages/Video.jsx";
import Image from "./pages/Image.jsx";
import Asavoir from "./pages/Asavoir.jsx";

export default function App() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />

      {/* Zone principale (header + pages) */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/prompt" element={<Prompt />} />
            <Route path="/video" element={<Video />} />
            <Route path="/image" element={<Image />} />
            <Route path="/asavoir" element={<Asavoir />} />
            <Route path="/" element={<Navigate to="/Accueil" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}