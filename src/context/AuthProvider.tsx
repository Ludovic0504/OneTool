'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import FullScreenLoader from '@/components/FullScreenLoader'

type AuthContextType = {
  session: any | null
  user: any | null
}
const AuthContext = createContext<AuthContextType>({ session: null, user: null })
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any | null>(null)

  useEffect(() => {
    let ignore = false

    supabase.auth.getSession().then(({ data }) => {
      if (!ignore) {
        setSession(data.session)
        setLoading(false)
      }
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
    })

    return () => {
      ignore = true
      sub.subscription.unsubscribe()
    }
  }, [])

  if (loading) return <FullScreenLoader />

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null }}>
      {children}
    </AuthContext.Provider>
  )
}
