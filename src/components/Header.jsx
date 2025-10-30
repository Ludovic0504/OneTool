// src/components/Header.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import LogoutButton from './LogoutButton';
import { Menu } from 'lucide-react'; // icône burger

// ⬇️ on reçoit la prop onOpenMenu depuis AppLayout
export default function Header({ onOpenMenu }) {
  const { session, loading } = useAuth();
  const email = session?.user?.email;

  // Placeholder pendant le chargement pour éviter les sauts de layout
  if (loading) {
    return (
      <header className="sticky top-0 z-20 bg-white border-b">
        <div className="flex items-center gap-3 px-4 h-14">
          <div className="md:hidden w-9 h-9" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="ml-auto h-6 w-28 bg-gray-200 rounded" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-20 bg-white border-b">
      <div className="flex items-center gap-3 px-4 h-14">
        {/* Burger visible seulement en mobile */}
        <button
          type="button"
          className="md:hidden p-2 -ml-2 rounded hover:bg-gray-100"
          aria-label="Ouvrir le menu"
          onClick={onOpenMenu}
        >
          <Menu />
        </button>

        {/* Titre/brand qui renvoie vers le dashboard */}
        <Link to="/dashboard" className="text-base sm:text-lg font-semibold">
          OneTool
        </Link>

        <div className="ml-auto flex items-center gap-3">
          {email ? (
            <>
              <span className="hidden sm:block text-sm text-gray-600">{email}</span>
              <LogoutButton />
            </>
          ) : (
            <Link to="/login" className="text-sm underline">Se connecter</Link>
          )}
        </div>
      </div>
    </header>
  );
}
