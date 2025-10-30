import { useSession } from '../supabase/useSession';

export default function ProtectedRoute({ children }) {
  const { session, loading } = useSession();

  if (loading) return <div style={{ padding: 16 }}>Chargement…</div>;

  // 🔓 Temporairement : on laisse tout passer
  return children;
}
