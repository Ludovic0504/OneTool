import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Prompt from "./pages/Prompt";
import Image from "./pages/Image";
import Video from "./pages/Video";
import ASavoir from "./pages/ASavoir.jsx";

function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/prompt" element={<Prompt />} />
        <Route path="/image" element={<Image />} />
        <Route path="/video" element={<Video />} />
        <Route path="/a-savoir" element={<ASavoir />} />

      </Route>

      {/* Route fallback si URL non reconnue */}
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
}
