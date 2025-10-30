// src/components/LogoutButton.jsx
import React from 'react';
import { useAuth } from '@/context/AuthProvider';

export default function LogoutButton() {
  const { supabase } = useAuth();
  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        // laisse le routeur/ProtectedRoute rediriger si nécessaire
      }}
    >
      Déconnexion
    </button>
  );
}
