'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
// si tu as @supabase/supabase-js en types, décommente :
// import type { Session, User } from '@supabase/supabase-js'

type AuthContextType = {
  session: any | null // Session | null
  user: any | null    // User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true

    // 1) lecture initiale
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session ?? null)
      setLoading(false)
    })

    // 2) écoute des changements
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess ?? null)
    })

    // cleanup
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
