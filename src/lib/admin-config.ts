/**
 * @fileOverview Configuration centralisée des accès administrateur pour StayFloow.com
 */

export const ADMIN_EMAILS = [
  "stayflow2025@gmail.com",
  "kiosque.du.passage@gmail.com"
];

export const ADMIN_UIDS = [
  "G4d04MgUW4fguFOjmhQBbWezheB2",
  "SoSElCrTcwh6UBtGjXwv4Q8dlXc2" // Nouvel UID Kamel Dahane
];

/**
 * Vérifie si un utilisateur Firebase est un administrateur
 */
export function checkIsAdmin(user: { uid: string; email?: string | null } | null | undefined): boolean {
  if (!user) return false;
  const email = user.email?.toLowerCase() || "";
  return ADMIN_UIDS.includes(user.uid) || ADMIN_EMAILS.includes(email);
}
