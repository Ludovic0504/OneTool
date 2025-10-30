import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../supabase/client'
import FullScreenLoader from '../components/FullScreenLoader'
import { useAuth } from '../context/AuthProvider'

// utils
function getSafeNext(raw) {
  let n = typeof raw === 'string' && raw.startsWith('/') ? raw : '/dashboard';
  if (n === '/login' || n.startsWith('/login')) n = '/dashboard';
  return n;
}

export default function Login() {
  const { session, loading } = useAuth();
  const [sp] = useSearchParams();
  const next = useMemo(() => getSafeNext(sp.get('next')), [sp]);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (session) navigate(next, { replace: true });
  }, [loading, session, next, navigate]);

  const [email, setEmail] = useState(sp.get('email') || '');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <FullScreenLoader label="Ouverture de la page de connexion…" />;

  async function onSubmit(e) {
    e.preventDefault();
    setErr(''); setInfo(''); setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate(next, { replace: true });
    } catch (e) {
      setErr(e.message || 'Connexion impossible.');
    } finally {
      setSubmitting(false);
    }
  }

  async function sendMagicLink() {
    setErr(''); setInfo(''); setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}${next}` },
      });
      if (error) throw error;
      setInfo("Lien envoyé ! Vérifie ta boîte mail.");
    } catch (e) {
      setErr(e.message || 'Envoi du lien impossible.');
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <main className="min-h-dvh grid place-items-center bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border bg-white/90 shadow-sm p-6">
          <div className="mb-5 text-center">
            <h1 className="text-2xl font-semibold">Connexion</h1>
            <p className="text-sm text-gray-500">Accède à ton espace OneTool</p>
          </div>

          {err && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
          {info && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{info}</div>}

          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block">
              <span className="text-sm text-gray-700">Email</span>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" type="email" value={email}
                     onChange={e=>setEmail(e.target.value)} placeholder="vous@exemple.com" autoComplete="email" required />
            </label>

            <label className="block">
              <span className="text-sm text-gray-700">Mot de passe</span>
              <div className="mt-1 flex items-stretch rounded-xl border">
                <input className="w-full rounded-xl px-3 py-2" type={showPw?'text':'password'} value={password}
                       onChange={e=>setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />
                <button type="button" onClick={()=>setShowPw(s=>!s)} className="px-3 text-sm text-gray-600">{showPw?'Masquer':'Afficher'}</button>
              </div>
            </label>

            <button disabled={submitting} className="w-full rounded-xl bg-black text-white py-2.5 font-medium disabled:opacity-60">
              {submitting ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-4 space-y-2">
            <button onClick={sendMagicLink} disabled={submitting || !email}
                    className="w-full rounded-xl border py-2.5 text-sm disabled:opacity-50">
              Recevoir un lien magique
            </button>
            <div className="text-center text-sm">
              <Link to="/" className="text-gray-600 hover:underline">← Retour</Link>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-gray-500">Sécurisé par Supabase Auth</p>
      </div>
    </main>
  );
}
