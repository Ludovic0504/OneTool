import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'

export default function LogoutRoute() {
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (e) {
        console.error('Erreur signOut :', e)
      } finally {
        await new Promise((r) => setTimeout(r, 50));
        navigate('/login', { replace: true })
      }
    })()
  }, [navigate])

  return null
}
