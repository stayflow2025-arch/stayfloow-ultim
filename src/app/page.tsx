import { HomeClient } from '@/components/home-client';
import { adminDb } from '@/firebase/admin';

/**
 * Page racine de StayFloow.com (Version Locale Master).
 * Implémentée en tant que Server Component pour un SEO et une vitesse de build optimisés.
 */
export default async function Home() {
  let siteConfig = null;

  try {
    if (adminDb) {
      const configSnap = await adminDb.collection("settings").doc("siteConfig").get();
      if (configSnap.exists) {
        siteConfig = configSnap.data();
      }
    }
  } catch (error) {
    console.error("Erreur récupération siteConfig SSR:", error);
  }

  return <HomeClient initialSiteConfig={siteConfig} />;
}
