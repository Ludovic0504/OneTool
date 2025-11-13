import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getBrowserSupabase, getRedirectTo } from "@/lib/supabase/browser-client";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [mlLoading, setMlLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [infoMsg, setInfoMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [showPwd, setShowPwd] = useState(false);       // NEW: toggle afficher/masquer
  const [remember, setRemember] = useState(true);      // NEW: rester connecté

  const redirectTo = useMemo(() => getRedirectTo(), []);

  const confirmedBanner = useMemo(
    () => (params.get("confirmed") === "1" ? "Adresse confirmée ✅ Vous pouvez vous connecter." : null),
    [params]
  );
  useEffect(() => {
    if (confirmedBanner) setInfoMsg(confirmedBanner);
  }, [confirmedBanner]);

  const next = useMemo(() => {
    const raw = new URLSearchParams(location.search).get("next") || "/dashboard";
    return raw.startsWith("/") ? raw : "/dashboard";
  }, [location.search]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setInfoMsg(null);

    // NEW: crée le client selon la case "Rester connecté"
    const supabase = getBrowserSupabase({ remember });

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message?.toLowerCase().includes("email not confirmed")) {
            setErrorMsg("Ton email n’est pas confirmé. Clique sur le lien reçu lors de l’inscription.");
          } else {
            setErrorMsg(error.message);
          }
          return;
        }
        navigate(next, { replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) return setErrorMsg(error.message);
        if (data.user && !data.session) {
          setSent(true);
          setInfoMsg("Compte créé ! Vérifie ta boîte mail et clique sur « S’enregistrer ».");
        }
      }
    } catch (err) {
      setErrorMsg(err?.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
  setErrorMsg("");

  // mémoriser remember et next
  try { localStorage.setItem("onetool_oauth_remember", remember ? "1" : "0"); } catch {}
  try { localStorage.setItem("onetool_oauth_next", next); } catch {}

  const supabase = getBrowserSupabase({ remember });

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo } // <-- IMPORTANT : PAS de paramètres dynamiques
  });

  if (error) setErrorMsg(error.message);
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C1116] text-white p-4">
      <div className="w-full max-w-sm bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-[0_0_20px_rgba(0,255,255,0.05)]">
        <h1 className="text-xl font-semibold mb-5 text-center">
          {mode === "signin" ? "Connexion" : "Créer un compte OneTool"}
        </h1>

        {errorMsg && (
          <div className="mb-3 text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg p-2">
            {errorMsg}
          </div>
        )}
        {(sent || infoMsg) && (
          <div className="mb-3 text-sm text-emerald-400 bg-emerald-900/20 border border-emerald-700 rounded-lg p-2">
            {infoMsg || "Vérifie ta boîte mail ✉️"}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-1 text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm mb-1 text-gray-300">
              {mode === "signin" ? "Mot de passe" : "Choisis un mot de passe"}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPwd ? "text" : "password"}
                className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 pr-20 outline-none focus:ring-2 focus:ring-emerald-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                {showPwd ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Rester connecté
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 text-black font-semibold py-2 hover:bg-emerald-400 active:bg-emerald-600 transition disabled:opacity-60"
          >
            {loading ? "Connexion..." : mode === "signin" ? "Se connecter" : "Créer le compte"}
          </button>

          <p className="text-xs text-gray-500 text-center mt-1">
            🔒 Tes données sont protégées — aucune utilisation commerciale.
          </p>
        </form>

        <div className="flex justify-between text-sm mt-4">
          <button
            className="underline underline-offset-2 text-gray-400 hover:text-white"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Créer un compte" : "J’ai déjà un compte"}
          </button>
        </div>

        <div className="my-4 h-px bg-white/10" />

        <button
          type="button"
          onClick={signInWithGoogle}
          className="w-full rounded-lg bg-gradient-to-r from-sky-500 to-emerald-400 text-black font-medium px-3 py-2 hover:opacity-90 active:opacity-80 transition"
        >
          Continuer avec Google
        </button>
      </div>
    </div>
  );
}
