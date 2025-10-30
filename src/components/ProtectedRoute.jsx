import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'
import FullScreenLoader from './FullScreenLoader' // garde ton composant existant

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) return <FullScreenLoader />
  if (!session) return <Navigate to="/login" replace />

  return children
}
