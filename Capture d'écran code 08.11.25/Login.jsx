import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getBrowserSupabase, getRedirectTo } from "@/lib/supabase/browser-client";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  // ⛔️ (on ne crée plus le client ici pour pouvoir choisir remember à la soumission)
  // const supabase = getBrowserSupabase();
  const redirectTo = useMemo(() => getRedirectTo(), []);
  const initialMode = useMemo(
    () => (params.get("mode") === "signup" ? "signup" : "signin"),
    [params]
  );

  const [mode, setMode] = useState(initialMode); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [mlLoading, setMlLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [infoMsg, setInfoMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [showPwd, setShowPwd] = useState(false);       // NEW: toggle afficher/masquer
  const [remember, setRemember] = useState(true);      // NEW: rester connecté

  const confirmedBanner = useMemo(
    () => (params.get("confirmed") === "1" ? "Adresse confirmée ✅ Vous pouvez vous connecter." : null),
    [params]
  );
  useEffect(() => {
    if (confirmedBanner) setInfoMsg(confirmedBanner);
  }, [confirmedBanner]);

  useEffect(() => {
  const m = params.get("mode");
  if (m === "signup" || m === "signin") setMode(m);
}, [params]);

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
    // NEW: idem pour OAuth
    const supabase = getBrowserSupabase({ remember });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) setErrorMsg(error.message);
    } catch (err) {
      setErrorMsg(err?.message || "Erreur inconnue");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-lg font-semibold mb-4">
          {mode === "signin" ? "Se connecter" : "Créer un compte"}
        </h1>

        {errorMsg && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {errorMsg}
          </div>
        )}
        {(sent || infoMsg) && (
          <div className="mb-4 p-3 -border border-green-200 bg-green-50 text-green-800 text-sm flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-green-500"
            >
              <path
                fillRule="evenodd"
                d="M18 8a6 6 0 11-12 0 6 6 0 0112 0zm-7-3a1 1 0 112 0v3a1 1 0 01-.553.894l-2 1A1 1 0 018.5 9.106L10 8.382V5z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <strong>Email envoyé !</strong><br />
              Vérifie ta boîte mail et clique sur le lien pour activer ton compte ✅
            </div>
          </div>
        )}


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
            <label className="block text-sm mb-1" htmlFor="password">
              {mode === "signin" ? "Mot de passe" : "Choisis un mot de passe"}
            </label>

            {/* NEW: conteneur + bouton Afficher/Masquer (changement minimal autour de l'input) */}
            <div className="relative">
              <input
                id="password"
                type={showPwd ? "text" : "password"}           // NEW
                className="w-full border rounded px-3 py-2 outline-none focus:ring pr-20" // NEW: pr-20 pour laisser la place au bouton
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}             // NEW
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600"
                aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPwd ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>

          {/* NEW: case Rester connecté */}
          <label className="inline-flex items-center gap-2 text-sm">
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
            className="w-full rounded bg-black text-white py-2 disabled:opacity-60"
          >
            {loading ? (mode === "signin" ? "Connexion..." : "Création...") :
              (mode === "signin" ? "Se connecter" : "S’enregistrer")}
          </button>
          <p className="mt-2 text-xs text-gray-500 text-center">
            🔒 Tes données sont protégées — aucune utilisation commerciale.
          </p>

        </form>

        <div className="flex justify-between text-sm mt-3">
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => {
                const nextMode = mode === "signin" ? "signup" : "signin";
                setMode(nextMode);
                setErrorMsg("");
                setInfoMsg(null);
                // 🔁 met à jour l’URL sans recharger la page
                const sp = new URLSearchParams(location.search);
                sp.set("mode", nextMode);
                navigate(`/login?${sp.toString()}`, { replace: true });
                }}
            >
                {mode === "signin" ? "Créer un compte" : "J’ai déjà un compte"}
            </button>


        <div className="my-4 h-px bg-gray-200" />

        <button
          type="button"
          onClick={signInWithGoogle}
          className="w-full rounded bg-blue-600 text-white px-3 py-2 font-medium hover:bg-blue-500 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
          Continuer avec Google
        </button>
      </div>
    </div>
  );
}
