import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard.jsx";
import Prompt from "./pages/Prompt.jsx";
import ImagePage from "./pages/Image.jsx";
import VideoPage from "./pages/Video.jsx";
import Asavoir from "./pages/Asavoir.jsx";
import Login from "./pages/Login.jsx";
import LogoutRoute from "./pages/LogoutRoute.jsx";
import { ErrorBoundary } from "react-error-boundary";

function AppErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => (
        <div className="min-h-dvh flex items-center justify-center text-center text-red-600">
          <div>
            <h1 className="text-lg font-semibold mb-2">Oups !</h1>
            <p className="text-sm">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-3 py-1 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Recharger
            </button>
          </div>
        </div>
      )}
      onError={(e) => console.error("Erreur capturée :", e)}
    >
      {children}
    </ErrorBoundary>
  );
}


export default function App() {
  return (
    <AppErrorBoundary>
      <Routes>
        {/* index -> dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* pages publiques (pas de sidebar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<LogoutRoute />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/health" element={<div style={{ padding: 20 }}>OK</div>} />


        {/* Toutes les pages accessibles avec sidebar, connecté ou non */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/prompt" element={<Prompt />} />
          <Route path="/image" element={<ImagePage />} />
          <Route path="/video" element={<VideoPage />} />
          <Route path="/a-savoir" element={<Asavoir />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppErrorBoundary>
  );
}

