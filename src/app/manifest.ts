import { MetadataRoute } from 'next';

/**
 * Génère le fichier manifest.json pour les navigateurs et le SEO.
 * Permet au site d'être installé comme une App (PWA) sur smartphone.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StayFloow.com | Hébergements, Voitures & Circuits en Afrique',
    short_name: 'StayFloow',
    description: 'La plateforme de référence pour réserver hôtels, voitures et excursions en Afrique.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#10B981',
    icons: [
      {
        src: 'https://picsum.photos/seed/stayfloow-192/192/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'https://picsum.photos/seed/stayfloow-512/512/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
