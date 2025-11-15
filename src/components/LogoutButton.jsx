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
  disabled={signingOut}
  className="
    inline-flex items-center gap-2
    rounded-md px-3 py-1.5 text-xs font-medium
    border border-white/10 text-gray-300
    hover:bg-white/5 active:bg-white/10
    disabled:opacity-50 disabled:cursor-not-allowed
    transition
  "
>
  {/* Icône visible partout */}
  <svg xmlns="http://www.w3.org/2000/svg" 
       className="h-4 w-4" 
       fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V3m0 0H6a2 2 0 00-2 2v14a2 2 0 002 2h7" />
  </svg>

  {/* Texte masqué sur mobile */}
  <span className="hidden sm:inline">
    {signingOut ? "Déconnexion…" : "Se déconnecter"}
  </span>
</button>

);
}
