import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../supabase/useSession';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute({ children }) {
  const { session, loading } = useSession();
  const location = useLocation();

  if (loading) return <LoadingScreen label="Vérification de la session…" />;

  if (!session) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
}
