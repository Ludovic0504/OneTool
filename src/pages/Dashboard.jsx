import { useAuth } from "@/context/AuthProvider";

export default function Dashboard() {
  const { session } = useAuth();

  return (
    <main className="px-4 py-8">
      {session ? (
        <h1 className="text-center font-semibold">Ton dashboard</h1>
      ) : (
        <div className="text-center">
          <h1 className="font-semibold">Bienvenue sur OneTool 🎉</h1>
          <p className="text-sm text-gray-600 mt-1">Tu n’es pas connecté.</p>
          {/* Pas de bouton ici — le CTA est dans le header */}
        </div>
      )}
    </main>
  );
}
