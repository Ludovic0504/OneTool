// app.mjs
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  TEST_USER_ID,
  TEST_EMAIL,
  TEST_PASSWORD,
} = process.env

// 1) client admin (service-role) pour définir un mot de passe
const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// 2) client “public” (anon) pour se connecter et requêter sous RLS
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function main() {
  // a) Assure un mot de passe sur l’utilisateur test
  const { data: upd, error: updErr } = await admin.auth.admin.updateUserById(TEST_USER_ID, {
    password: TEST_PASSWORD
  })
  if (updErr) {
    console.error('❌ updateUserById error:', updErr)
    return
  }
  console.log('🔒 Password set for test user')

  // b) Connexion avec l’ANON key (comme un vrai client)
  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  })
  if (signInErr) {
    console.error('❌ signIn error:', signInErr)
    return
  }
  console.log('✅ Signed in as', signInData.user.email)

  // c) Lire l’org liée via la table profiles
  const { data, error } = await supabase
    .from('profiles')
    .select('organization_id, organizations(name)')
    .eq('user_id', TEST_USER_ID)
    .single()

  if (error) {
    console.error('❌ select error:', error)
    return
  }

  console.log('🏢 Org linked to user:', data?.organizations?.name, '(' + data?.organization_id + ')')
}

main().catch(console.error)
