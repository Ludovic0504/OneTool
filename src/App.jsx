import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Prompt from './pages/Prompt';
import ImagePage from './pages/Image';
import VideoPage from './pages/Video';
import Asavoir from './pages/Asavoir';
import Login from './pages/Login';
import LogoutRoute from './pages/LogoutRoute';

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
  {/* index -> dashboard */}
  <Route path="/" element={<Navigate to="/dashboard" replace />} />

  {/* pages publiques hors layout */}
  <Route path="/login" element={<Login />} />
  <Route path="/logout" element={<LogoutRoute />} />

  {/* pages sous layout (publiques) */}
  <Route element={<AppLayout />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/prompt"    element={<Prompt />} />
    <Route path="/image"     element={<ImagePage />} />
    <Route path="/video"     element={<VideoPage />} />
    <Route path="/a-savoir"  element={<Asavoir />} />
  </Route>

  {/* wildcard en dernier */}
  <Route path="*" element={<Navigate to="/dashboard" replace />} />
</Routes>

  );
}
