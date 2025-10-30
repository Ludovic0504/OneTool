import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';

export default function LogoutRoute() {
  const navigate = useNavigate();
  useEffect(() => { (async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  })(); }, [navigate]);
  return null;
}
