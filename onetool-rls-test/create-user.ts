// onetool-rls-test/create-user.ts
import 'dotenv/config'
import { supabase } from './lib/supabase-admin.ts'

async function main() {
  console.log('Vérification du projet :', process.env.SUPABASE_URL)

  const { data, error } = await supabase.auth.admin.createUser({
    email: process.env.TEST_EMAIL!,
    password: process.env.TEST_PASSWORD!,
    email_confirm: true,
  })

  if (error) {
    console.error('❌ Erreur création utilisateur :', error)
  } else {
    console.log('✅ Utilisateur créé avec succès :', data.user?.id)
  }
}

main()
