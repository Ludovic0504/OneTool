// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBrowserSupabase } from "@/lib/supabase/browser-client";

export default function Login() {
  const navigate = useNavigate();
  const supabase = getBrowserSupabase();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const redirectTo = `${window.location.origin}/auth/callback`;

  async function signInWithGoogle() {
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (e) {
      console.error("[Login] Google OAuth error:", e);
      setErrorMsg(e?.message || "Erreur OAuth (Google)");
    }
  }

  async function signInWithGithub() {
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (e) {
      console.error("[Login] GitHub OAuth error:", e);
      setErrorMsg(e?.message || "Erreur OAuth (GitHub)");
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setErrorMsg(e?.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  // Magic Link
  async function sendMagicLink() {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      setSuccessMsg("Lien magique envoyé ! Vérifie ta boîte mail 📩");
    } catch (e) {
      console.error("[Login] Magic link error:", e);
      setErrorMsg(e?.message || "Erreur lors de l’envoi du lien magique");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#f1f5f9]">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow">
        <h1 className="text-xl font-semibold mb-4 text-gray-900">Connexion</h1>

        <div className="space-y-2 mb-4">
          <button
            onClick={signInWithGoogle}
            className="w-full rounded-md bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-500 active:bg-blue-700 transition-colors"
          >
            Continuer avec Google
          </button>
          <button
            onClick={signInWithGithub}
            className="w-full rounded-md bg-gray-900 text-white py-2 text-sm font-medium hover:bg-gray-800 active:bg-black transition-colors"
          >
            Continuer avec GitHub
          </button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">ou</span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            autoComplete="email"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            autoComplete="current-password"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-gray-900 text-white py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={sendMagicLink}
            disabled={!email || loading}
            className="text-sm text-blue-600 hover:underline disabled:opacity-50"
          >
            Magic link
          </button>
        </div>

        {errorMsg && <p className="mt-3 text-sm text-red-600">{errorMsg}</p>}
        {successMsg && <p className="mt-3 text-sm text-green-600">{successMsg}</p>}
      </div>
    </div>
  );
}
