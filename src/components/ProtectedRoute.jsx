import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import FullScreenLoader from "./FullScreenLoader";

/**
 * Protège une section de routes.
 * - Pendant la vérif de session: affiche un loader
 * - Si non connecté: redirige vers /login?next=<route demandée>
 * - Sinon: rend les enfants
 */
export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  // Pendant la lecture de la session (SSR/refresh): loader
  if (loading) {
    return <FullScreenLoader label="Vérification de la session…" />;
  }

  // Utilisateur non connecté → redirection vers /login avec la route d'origine
  if (!session) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  // OK
  return children;
}
