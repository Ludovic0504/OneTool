import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { session } = useAuth();

  if (!session) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Bienvenue sur OneTool 🎉</h2>
        <p className="mt-2 text-gray-600">Tu n’es pas connecté.</p>
        <Link to="/login" className="mt-4 inline-block underline">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Ton dashboard</h2>
      {/* contenu authentifié */}
    </div>
  );
}
