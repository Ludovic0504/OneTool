import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function LogoutRoute() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        await signOut();
      } finally {
        navigate('/login', { replace: true });
      }
    })();
  }, [navigate, signOut]);

  return null;
}
