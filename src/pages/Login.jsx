import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { useSession } from '../supabase/useSession';

export default function Login() {
  const { session } = useSession();
  const [sp] = useSearchParams();
  const next = sp.get('next') || '/dashboard';
  const navigate = useNavigate();

  // Déjà connecté ? -> aller direct vers "next"
  useEffect(() => {
    if (session) navigate(next, { replace: true });
  }, [session, navigate, next]);

  const [email, setEmail] = useState('test@onetool.local'); // pour tes tests
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);
    navigate(next, { replace: true });
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 p-6 rounded-2xl border bg-white">
        <h1 className="text-2xl font-semibold text-center">Connexion</h1>
        {err && <p className="text-sm text-red-600">{err}</p>}

        <label className="block">
          <span className="text-sm">Email</span>
          <input
            className="mt-1 w-full border rounded-xl p-3"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            placeholder="vous@exemple.com"
          />
        </label>

        <label className="block">
          <span className="text-sm">Mot de passe</span>
          <input
            className="mt-1 w-full border rounded-xl p-3"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        <button
          disabled={loading}
          className="w-full rounded-xl p-3 border font-medium disabled:opacity-50"
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>

        <div className="text-center text-sm">
          <Link to="/" className="text-gray-600 hover:underline">← Retour</Link>
        </div>
      </form>
    </main>
  );
}
