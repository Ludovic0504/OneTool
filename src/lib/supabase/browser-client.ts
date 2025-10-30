// src/lib/supabase/browser-client.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

declare global {
  // évite les recréations en HMR
  // eslint-disable-next-line no-var
  var __supabase__: SupabaseClient | undefined;
}

export function getBrowserSupabase(): SupabaseClient {
  if (globalThis.__supabase__) return globalThis.__supabase__;

  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  const client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage, // explicite
    },
    global: {
      // (optionnel) ajoute un fetch custom si besoin
    },
  });

  globalThis.__supabase__ = client;
  return client;
}
