
/**
 * @fileOverview Configuration centralisée des accès administrateur pour StayFloow.com
 */

export const ADMIN_EMAILS = [
  "stayflow2025@gmail.com"
];

export const ADMIN_UIDS = [
  "G4d04MgUW4fguFOjmhQBbWezheB2",
  "Kb7jQGxp4pf1cjdfbMwz4HnujQi2",
  "CChLqb7OxdbbSpjNRKMAt2vJNa12",
  "3rixbVLeMaUARuODthz3ds80WeS2"
];

/**
 * Vérifie si un utilisateur Firebase est l'administrateur maître
 */
export function checkIsAdmin(user: { uid: string; email?: string | null } | null | undefined): boolean {
  if (!user) return false;
  const email = user.email?.toLowerCase() || "";
  return email === "stayflow2025@gmail.com" || ADMIN_UIDS.includes(user.uid);
}
