import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'

export default function LogoutRoute() {
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      try {
        await supabase.auth.signOut()
      } catch (e) {
        console.error('Erreur signOut :', e)
      } finally {
        navigate('/login', { replace: true })
      }
    })()
  }, [navigate])

  return null
}
