import { MetadataRoute } from 'next';

/**
 * Génère le plan du site (sitemap.xml) pour Google.
 * Indispensable pour que Google découvre toutes vos pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.stayfloow.com';
  
  const routes = [
    '',
    '/search',
    '/cars',
    '/cars/results',
    '/circuits',
    '/circuits/results',
    '/partners/join',
    '/contact',
    '/about',
    '/terms',
    '/privacy',
    '/auth/login',
    '/auth/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
