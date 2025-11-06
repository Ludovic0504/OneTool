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

  const onSendMagicLink = async () => {
    setErrorMsg("");
    setSent(false);
    setMlLoading(true);
    // NEW: garde le même choix de persistance pour le flux magic link
    const supabase = getBrowserSupabase({ remember });
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) return setErrorMsg(error.message);
      setSent(true);
    } catch (err) {
      setErrorMsg(err?.message || "Erreur inconnue");
    } finally {
      setMlLoading(false);
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
          <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
            {infoMsg || "Lien envoyé ✅ — vérifie ta boîte mail"}
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
        </form>

        <div className="flex justify-between text-sm mt-3">
          <button
            className="underline underline-offset-2"
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setErrorMsg(""); setInfoMsg(null); }}
          >
            {mode === "signin" ? "Créer un compte" : "J’ai déjà un compte"}
          </button>
        </div>

        <div className="my-4 h-px bg-gray-200" />

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
