import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getBrowserSupabase } from "@/lib/supabase/browser-client";

export default function AuthCallback() {
  const location = useLocation();

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(location.search);

      // destination finale (si login?next=/truc)
      let next = "/dashboard";
      try {
        const v = localStorage.getItem("onetool_oauth_next");
        if (v && v.startsWith("/")) next = v;
      } catch {}

      // 1) lire remember depuis le storage
      let remember = false;
      try { remember = localStorage.getItem("onetool_oauth_remember") === "1"; } catch {}

      // 2) erreur renvoyée par le provider ?
      if (params.get("error")) {
        window.location.replace("/login?error=callback"); // hard reload
        return;
      }

      const supabase = getBrowserSupabase({ remember });
      const href = window.location.href;
      const hasCode  = href.includes("code=");
      const hasToken = href.includes("access_token=");

      // 2bis) hash vide (#) → on check la session
      if (!hasCode && !hasToken && (window.location.hash === "#" || window.location.hash === "")) {
        const { data, error } = await supabase.auth.getSession();
        if (!error && data?.session) {
          try { localStorage.removeItem("onetool_oauth_remember"); } catch {}
          try { localStorage.removeItem("onetool_oauth_next"); } catch {}
          window.location.replace(next);
        } else {
          window.location.replace("/login?error=empty");
        }
        return;
      }

      // 3) FLOW IMPLICITE (#access_token)
      if (hasToken && !hasCode) {
        const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
        if (error) {
          window.location.replace("/login?error=callback");
          return;
        }
        try { localStorage.removeItem("onetool_oauth_remember"); } catch {}
        try { localStorage.removeItem("onetool_oauth_next"); } catch {}
        window.location.replace(next);
        return;
      }

      // 4) FLOW PKCE (?code=...)
      if (hasCode) {
        let exchangeError = null;
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(href);
          exchangeError = error ?? null;
        } catch (e) {
          exchangeError = e;
        }

        // fallback si mismatch de stockage (code_verifier / pkce)
        if (exchangeError) {
          const msg = String(exchangeError.message || exchangeError || "").toLowerCase();
          if (msg.includes("code_verifier") || msg.includes("pkce") || msg.includes("verifier")) {
            try {
              const alt = getBrowserSupabase({ remember: !remember });
              const { error } = await alt.auth.exchangeCodeForSession(href);
              exchangeError = error ?? null;
            } catch (e2) {
              exchangeError = e2;
            }
          }
        }

        if (exchangeError) {
          window.location.replace("/login?error=callback");
          return;
        }

        try { localStorage.removeItem("onetool_oauth_remember"); } catch {}
        try { localStorage.removeItem("onetool_oauth_next"); } catch {}
        window.location.replace(next);
        return;
      }

      // 5) aucun code ni token → URL anormale
      window.location.replace("/login?error=callback");
    })();
  }, [location.search]);

  return <p className="p-6">Validation en cours…</p>;
}
