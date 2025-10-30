import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import supabase from "../supabase/client";
import FullScreenLoader from "../components/FullScreenLoader";
import { useAuth } from "../context/AuthProvider";

// --- utils ---
function getSafeNext(raw) {
  let n = typeof raw === "string" && raw.startsWith("/") ? raw : "/dashboard";
  if (n === "/login" || n.startsWith("/login")) n = "/dashboard";
  return n;
}

export default function Login() {
  const { session, loading } = useAuth();
  const [sp] = useSearchParams();
  const next = useMemo(() => getSafeNext(sp.get("next")), [sp]);
  const navigate = useNavigate();

  // form state
  const [email, setEmail] = useState(sp.get("email") || "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // UI state
  const [info, setInfo] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const emailRef = useRef(null);
  const pwRef = useRef(null);

  // redirect if already logged in
  useEffect(() => {
    if (loading) return;
    if (session) navigate(next, { replace: true });
  }, [loading, session, next, navigate]);

  // focus management
  useEffect(() => {
    if (!email) emailRef.current?.focus();
    else pwRef.current?.focus();
  }, []); // only once

  if (loading) return <FullScreenLoader label="Ouverture de la page de connexion…" />;

  // --- actions ---
  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setInfo("");
    setSubmitting(true);
    try {
      if (!email || !password) throw new Error("Email et mot de passe requis.");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate(next, { replace: true });
    } catch (e) {
      setErr(e.message || "Connexion impossible.");
    } finally {
      setSubmitting(false);
    }
  }

  async function sendMagicLink() {
    setErr("");
    setInfo("");
    setSubmitting(true);
    try {
      if (!email) throw new Error("Renseigne ton email pour recevoir le lien.");
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}${next}` },
      });
      if (error) throw error;
      setInfo("Lien envoyé ✅ Vérifie ta boîte mail.");
    } catch (e) {
      setErr(e.message || "Envoi du lien impossible.");
    } finally {
      setSubmitting(false);
    }
  }

  // basic validation (désactive le CTA si invalide)
  const emailOk = /\S+@\S+\.\S+/.test(email);
  const canSubmit = emailOk && password.length >= 6 && !submitting;

  return (
    <main className="min-h-dvh grid place-items-center bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl border bg-white/90 shadow-sm p-6">
          {/* Title */}
          <div className="mb-5 text-center">
            <h1 className="text-2xl font-semibold">Connexion</h1>
            <p className="mt-1 text-sm text-gray-600">
              Accède à ton espace <span className="font-medium">OneTool</span>
            </p>
          </div>

          {/* Alerts */}
          {err && (
            <div
              role="alert"
              className="mb-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {err}
            </div>
          )}
          {info && (
            <div
              role="status"
              className="mb-3 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
            >
              {info}
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-3">
            {/* Email */}
            <label className="block">
              <span className="text-sm text-gray-700">Email</span>
              <input
                ref={emailRef}
                type="email"
                inputMode="email"
                autoComplete="email"
                className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                aria-invalid={!emailOk ? "true" : "false"}
              />
            </label>

            {/* Password */}
            <label className="block">
              <span className="text-sm text-gray-700">Mot de passe</span>
              <div className="mt-1 flex items-stretch rounded-xl border">
                <input
                  ref={pwRef}
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  className="flex-1 rounded-l-xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="rounded-r-xl border-l px-3 text-sm text-gray-600"
                  aria-pressed={showPw}
                  aria-label={showPw ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPw ? "Masquer" : "Afficher"}
                </button>
              </div>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`mt-1 w-full rounded-xl px-4 py-2.5 font-medium
                ${canSubmit ? "border bg-black text-white hover:opacity-90" : "border bg-gray-100 text-gray-400"}
              `}
            >
              {submitting ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          {/* Separator */}
          <div className="my-4 flex items-center gap-2 text-xs text-gray-500">
            <div className="h-px flex-1 bg-gray-200" />
            ou
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Magic link */}
          <div className="space-y-2">
            <button
              onClick={sendMagicLink}
              disabled={submitting || !emailOk}
              className={`w-full rounded-xl border px-4 py-2 text-sm
                ${submitting || !emailOk ? "bg-gray-100 text-gray-400" : "hover:bg-gray-50"}
              `}
            >
              Recevoir un lien magique
            </button>
            <p className="text-center text-xs text-gray-500">
              Le lien redirigera vers <span className="font-medium">{next}</span>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-5 text-center text-xs text-gray-500">
            Sécurisé par Supabase Auth
          </div>
        </div>

        {/* Back link */}
        <div className="mt-3 text-center">
          <Link to="/" className="text-sm text-gray-600 underline hover:text-gray-900">
            ← Retour
          </Link>
        </div>
      </div>
    </main>
  );
}
