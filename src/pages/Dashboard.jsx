import { useAuth } from "@/context/AuthProvider";

export default function Dashboard() {
  const { session } = useAuth();
  return (
    <main className="safe-padded min-h-full flex flex-col items-center justify-center text-center">
      {session ? (
        <h1 className="text-xl font-semibold">Ton dashboard</h1>
      ) : (
        <div>
          <h1 className="text-xl font-semibold">Bienvenue sur OneTool 🎉</h1>
          <p className="text-sm text-gray-600 mt-1">Tu n’es pas connecté.</p>
        </div>
      )}
    </main>
  );
}
