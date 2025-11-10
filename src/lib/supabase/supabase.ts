import { createClient } from '@supabase/supabase-js';


const url = import.meta.env.VITE_SUPABASE_URL!;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY!;


export const supabase = createClient(url, anon, {
auth: {
flowType: 'pkce', // pour gérer proprement les redirections (email confirm/OAuth)
persistSession: true,
autoRefreshToken: true,
},
});