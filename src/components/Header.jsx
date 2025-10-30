import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'
import LogoutButton from './LogoutButton'

export default function Header() {
  const { session, loading } = useAuth()

  // ✅ 1. Si la session est en cours de chargement, on garde le layout stable (placeholder)
  if (loading) {
    return (
      <header className="flex items-center justify-between p-4">
        <h1 className="text-xl font-semibold">
          <Link to="/dashboard">OneTool</Link>
        </h1>
        <div className="h-5 w-28 rounded bg-gray-200" />
      </header>
    )
  }

  const email = session?.user?.email

  return (
    <header className="flex items-center justify-between p-4">
      {email ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{email}</span>
          <LogoutButton />
        </div>
      ) : (
        <Link to="/login" className="text-sm underline">
          Se connecter
        </Link>
      )}
    </header>
  )
}
