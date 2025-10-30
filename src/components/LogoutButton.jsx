import { supabase } from '../supabase/client';

export default function LogoutButton({ className = '' }) {
  return (
    <button
      onClick={async () => { await supabase.auth.signOut(); }}
      className={className || 'px-3 py-1 rounded border text-sm'}
    >
      Se déconnecter
    </button>
  );
}
