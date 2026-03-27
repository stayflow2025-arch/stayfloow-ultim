'use client';

import { useUser as useUserFromProvider } from '../provider';

/**
 * Hook d'authentification client.
 * Utilise l'implémentation centralisée du FirebaseProvider pour une synchronisation parfaite.
 */
export function useUser() {
  return useUserFromProvider();
}
