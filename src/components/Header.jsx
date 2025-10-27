import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 border-b bg-white">
      <h1 className="text-xl font-bold">OneTool</h1>

      <Link
        to="/login"
        className="border px-3 py-1 rounded hover:bg-gray-100 transition"
      >
        Se connecter
      </Link>
    </header>
  );
}
