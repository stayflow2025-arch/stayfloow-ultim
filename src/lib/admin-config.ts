
/**
 * @fileOverview Configuration centralisée des accès administrateur pour StayFloow.com
 * SEUL le compte maître stayflow2025@gmail.com est autorisé.
 */

export const ADMIN_EMAILS = [
  "stayflow2025@gmail.com"
];

export const ADMIN_UIDS = [
  "G4d04MgUW4fguFOjmhQBbWezheB2"
];

/**
 * Vérifie si un utilisateur Firebase est l'administrateur maître
 */
export function checkIsAdmin(user: { uid: string; email?: string | null } | null | undefined): boolean {
  if (!user) return false;
  const email = user.email?.toLowerCase() || "";
  // Vérification stricte par email ou par UID maître
  return email === "stayflow2025@gmail.com" || ADMIN_UIDS.includes(user.uid);
}
