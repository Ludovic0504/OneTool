// src/lib/supabase/browser-client.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

declare global {
  // évite les recréations en HMR
  // eslint-disable-next-line no-var
  var __supabase__: SupabaseClient | undefined
  // on mémorise le type de storage du client courant
  // eslint-disable-next-line no-var
  var __supabase_storage_kind__: 'local' | 'session' | undefined
}

function storageFor(remember: boolean): Storage {
  return remember ? window.localStorage : window.sessionStorage
}

/**
 * Client navigateur Supabase.
 * - Par défaut: même comportement qu’avant (persistSession + localStorage)
 * - Avec { remember: false } : utilise sessionStorage (la session disparaît à la fermeture de l’onglet)
 */
export function getBrowserSupabase(opts: { remember?: boolean } = {}): SupabaseClient {
  const remember = opts.remember ?? true
  const desiredKind: 'local' | 'session' = remember ? 'local' : 'session'

  if (globalThis.__supabase__ && globalThis.__supabase_storage_kind__ === desiredKind) {
    return globalThis.__supabase__
  }

  const url = import.meta.env.VITE_SUPABASE_URL as string
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

  const client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: storageFor(remember),
    },
  })

  globalThis.__supabase__ = client
  globalThis.__supabase_storage_kind__ = desiredKind
  return client
}

export const getRedirectTo = () => {
  const origin =
    (typeof window !== 'undefined' && window.location?.origin) ||
    (import.meta.env.VITE_SITE_URL as string) ||
    ''
  return `${origin}/auth/callback`
}
