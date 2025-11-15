import { LogOut } from "lucide-react";
export default function LogoutButton({ className }) {
  const [busy, setBusy] = React.useState(false);

  const handleLogout = async () => {
    try {
      setBusy(true);
      await supabase.auth.signOut();
      // router.navigate('/login') ou équivalent
    } finally {
      setBusy(false);
    }
  };

  return (
  <button
    type="button"
    onClick={handleLogout}
    disabled={busy}
    className={
      (className ?? "") +
      " appearance-none inline-flex items-center gap-2 rounded-md px-3 py-2 " +
      " border border-white/10 text-gray-300 hover:bg-white/5 active:bg-white/10 " +
      " disabled:opacity-50 disabled:cursor-not-allowed transition"
    }
  >
    {busy ? (
      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
        <path d="M22 12a10 10 0 0 1-10 10" fill="currentColor" />
      </svg>
    ) : (
      <LogOut className="h-4 w-4" />
    )}

    {/* Texte masqué sur mobile, visible à partir de sm */}
    <span className="hidden sm:inline">
      {busy ? "Déconnexion…" : "Se déconnecter"}
    </span>
  </button>
);
}
