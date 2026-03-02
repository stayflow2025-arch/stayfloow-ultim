import { MetadataRoute } from 'next';

/**
 * Configure les règles pour les robots d'indexation (robots.txt).
 * Indique à Google ce qu'il peut lire et où se trouve le sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin', 
        '/admin/*', 
        '/profile', 
        '/profile/*', 
        '/auth/reset-password',
        '/api/*'
      ],
    },
    sitemap: 'https://www.stayfloow.com/sitemap.xml',
  };
}
