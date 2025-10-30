import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import { useSession } from "../supabase/useSession";

export default function Header() {
  const { session } = useSession();

  return (
    <header className="flex justify-between items-center px-6 py-3 border-b bg-white">
      <h1 className="text-xl font-semibold">OneTool</h1>

      <div className="flex items-center gap-4">
        {session ? (
          <>
            <span className="text-sm text-gray-600">
              Connecté : {session.user.email}
            </span>
            <LogoutButton />
          </>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 border rounded-xl hover:bg-gray-50 transition"
          >
            Se connecter
          </Link>
        )}
      </div>
    </header>
  );
}
