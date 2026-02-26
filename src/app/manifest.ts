import { MetadataRoute } from 'next';

/**
 * Génère le fichier manifest.json pour les navigateurs et le SEO.
 * Améliore l'installation du site sur mobile et la visibilité sur Google.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StayFloow.com | Hébergements, Voitures & Circuits en Afrique',
    short_name: 'StayFloow',
    description: 'La plateforme de référence pour réserver hôtels, riads, locations de voitures et excursions en Afrique.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#14532d',
    lang: 'fr',
    icons: [
      {
        src: 'https://picsum.photos/seed/stayfloow-icon/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/stayfloow-icon-512/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
