import { supabase } from '../supabase/client'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider' // optionnel

export default function LogoutButton() {
  const navigate = useNavigate()
  const { loading } = useAuth() // optionnel

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Erreur lors de la déconnexion :', error.message)
      return
    }
    navigate('/login', { replace: true })
  }

  return (
    <button onClick={handleLogout} disabled={loading}>
      Se déconnecter
    </button>
  )
}
