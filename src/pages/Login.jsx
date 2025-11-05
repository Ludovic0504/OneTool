import { useState } from "react";
import { useNavigate } from "react-router-dom";
// 👉 utilise le client unique
import { getBrowserSupabase } from "@/lib/supabase/browser-client";

export default function Login() {
  const navigate = useNavigate();
  const supabase = getBrowserSupabase();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mlLoading, setMlLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
        return;
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrorMsg(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      if (error) setErrorMsg(error.message);
    } catch (err) {
      setErrorMsg(err.message || "Erreur inconnue");
    }
  };

    // ✅ Magic Link (NOUVEAU)
  const onSendMagicLink = async () => {
    setErrorMsg("");
    setSent(false);
    setMlLoading(true);
    try {
      const origin = import.meta.env.VITE_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${origin}/auth/callback` },
      });
      if (error) return setErrorMsg(error.message);
      setSent(true);
    } catch (err) {
      setErrorMsg(err.message || "Erreur inconnue");
    } finally {
      setMlLoading(false);
    }
  };

  return (
  <div className="min-h-screen w-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="w-full max-w-sm bg-white border rounded-xl p-6 shadow-sm">
      <h1 className="text-lg font-semibold mb-4">Se connecter</h1>

      {/* alertes */}
      {errorMsg && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {errorMsg}
        </div>
      )}
      {sent && (
        <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
          Lien envoyé ✅ — vérifie ta boîte mail
        </div>
      )}

      {/* --- Formulaire email + mot de passe --- */}
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="w-full border rounded px-3 py-2 outline-none focus:ring"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            className="w-full border rounded px-3 py-2 outline-none focus:ring"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black text-white py-2 disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <div className="my-4 h-px bg-gray-200" />

      {/* --- Bouton Magic Link (séparé) --- */}
      <button
        type="button"
        onClick={onSendMagicLink}
        disabled={!email || mlLoading}
        className="w-full rounded border px-3 py-2"
        title="Recevoir un lien de connexion par email"
      >
        {mlLoading ? "Envoi du lien..." : "Recevoir un lien magique"}
      </button>

      <div className="my-4 h-px bg-gray-200" />

      {/* --- Bouton Google (séparé) --- */}
      <button
        type="button"
        onClick={signInWithGoogle}
        className="w-full rounded border px-3 py-2 hover:bg-gray-50"
      >
        Continuer avec Google
      </button>
    </div>
  </div>
);
}
