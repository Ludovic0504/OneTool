import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { useSession } from '../supabase/useSession';
import LoadingScreen from '../components/LoadingScreen';

export default function Login() {
  const { session, loading } = useSession();
  const [sp] = useSearchParams();
  const next = sp.get('next') || '/dashboard';
  const navigate = useNavigate();

  // Déjà connecté ? -> redirige automatiquement
  useEffect(() => {
    if (!loading && session) navigate(next, { replace: true });
  }, [loading, session, navigate, next]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState('');

  if (loading) return <LoadingScreen label="Ouverture de la page de connexion…" />;

  async function onSubmit(e) {
    e.preventDefault();
    setErr(''); setInfo(''); setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) return setErr(error.message);
    navigate(next, { replace: true });
  }

  // (Optionnel) Lien magique – pratique quand on ne veut pas gérer les mdp
  async function sendMagicLink() {
    setErr(''); setInfo(''); setSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` }
    });
    setSubmitting(false);
    if (error) return setErr(error.message);
    setInfo('Lien envoyé ! Vérifie ta boîte mail.');
  }

  return (
    <main className="min-h-dvh grid place-items-center bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="w-full max-w-sm">
        {/* Carte */}
        <div className="rounded-2xl border bg-white/90 shadow-sm p-6">
          {/* Titre */}
          <div className="mb-5 text-center">
            <div className="mx-auto mb-2 h-10 w-10 rounded-full grid place-items-center border">
              <span className="text-sm font-semibold">OT</span>
            </div>
            <h1 className="text-2xl font-semibold">Connexion</h1>
            <p className="text-sm text-gray-500">Accède à ton espace OneTool</p>
          </div>

          {/* Messages */}
          {err && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}
          {info && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {info}
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block">
              <span className="text-sm text-gray-700">Email</span>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                type="email"
                autoComplete="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-700">Mot de passe</span>
              <div className="mt-1 flex items-stretch rounded-xl border focus-within:ring-2 focus-within:ring-gray-900/10">
                <input
                  className="w-full rounded-xl px-3 py-2 outline-none"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="px-3 text-sm text-gray-600 hover:text-gray-900"
                  aria-label={showPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPw ? 'Masquer' : 'Afficher'}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-black text-white py-2.5 font-medium disabled:opacity-60"
            >
              {submitting ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          {/* Actions secondaires */}
          <div className="mt-4 space-y-2">
            <button
              onClick={sendMagicLink}
              disabled={submitting || !email}
              className="w-full rounded-xl border py-2.5 text-sm disabled:opacity-50"
              title="Envoie un lien de connexion à ton adresse"
            >
              Recevoir un lien magique
            </button>

            <div className="text-center text-sm">
              <Link to="/" className="text-gray-600 hover:underline">← Retour</Link>
            </div>
          </div>
        </div>

        {/* Mentions */}
        <p className="mt-3 text-center text-xs text-gray-500">
          Sécurisé par Supabase Auth
        </p>
      </div>
    </main>
  );
}
