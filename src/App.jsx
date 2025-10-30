import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
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

      {/* login public, hors layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<LogoutRoute />} />

      {/* privé sous layout */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/prompt" element={<ProtectedRoute><Prompt /></ProtectedRoute>} />
        <Route path="/image" element={<ProtectedRoute><ImagePage /></ProtectedRoute>} />
        <Route path="/video" element={<ProtectedRoute><VideoPage /></ProtectedRoute>} />
        <Route path="/a-savoir" element={<ProtectedRoute><Asavoir /></ProtectedRoute>} />
      </Route>

      {/* wildcard à la fin uniquement */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
