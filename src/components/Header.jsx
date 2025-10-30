import { Link } from 'react-router-dom';
import { useSession } from '../supabase/useSession';
import LogoutButton from './LogoutButton';

export default function Header() {
  const { session, loading } = useSession();

  return (
    <header className="flex items-center justify-between p-4">
      <h1 className="text-xl font-semibold">OneTool</h1>

      {loading ? null : session ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{session.user?.email}</span>
          <LogoutButton />
        </div>
      ) : (
        <Link to="/login" className="text-sm underline">Se connecter</Link>
      )}
    </header>
  );
}
