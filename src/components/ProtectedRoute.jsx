import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../supabase/useSession';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute({ children }) {
  // ➜ Mode public : pas d’auth
  if (import.meta.env.VITE_REQUIRE_AUTH !== '1') return children;

  const { session, loading } = useSession();
  const location = useLocation();

  if (loading) return <LoadingScreen label="Vérification de la session…" />;

  if (!session) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
}
