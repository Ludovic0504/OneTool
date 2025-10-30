import { supabase } from '../supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LogoutButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // après logout : renvoyer vers /login avec next = page courante (utile si on était sur /image, etc.)
    const next = encodeURIComponent(location.pathname + location.search);
    navigate(`/login?next=${next}`, { replace: true });
  };

  return (
    <button onClick={handleLogout} className="px-3 py-2 rounded-xl border">
      Se déconnecter
    </button>
  );
}
