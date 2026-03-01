
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../init';

/**
 * Hook d'authentification robuste.
 * Utilise l'instance Firebase Auth centralisée pour une détection immédiate.
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    }, (error) => {
      console.error("Auth observer error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
