import { HomeClient } from '@/components/home-client';

/**
 * Page racine de StayFloow.com.
 * Version stabilisée sans appels Admin au premier rendu pour éviter les crashs Runtime Firebase.
 */
export default async function Home() {
  // Désactivation temporaire du fetch SSR pour garantir l'affichage du site
  return <HomeClient initialSiteConfig={null} />;
}

