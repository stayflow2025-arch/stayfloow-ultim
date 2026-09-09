import { MetadataRoute } from 'next';
import { getFirestore } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.stayfloow.com';
  
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cars`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/circuits`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/partners/join`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  try {
    const db = getFirestore();
    if (!db) return staticRoutes;

    const listingsRef = collection(db, 'listings');
    const q = query(listingsRef, where('status', '==', 'approved'));
    const listingsSnapshot = await getDocs(q);
    
    const dynamicRoutes: MetadataRoute.Sitemap = listingsSnapshot.docs.map(doc => {
      const data = doc.data();
      let path = 'properties'; // default
      if (data.category === 'car_rental') path = 'cars';
      else if (data.category === 'circuit') path = 'circuits';
      
      const lastMod = data.updatedAt ? new Date(data.updatedAt) : (data.createdAt ? new Date(data.createdAt) : new Date());

      return {
        url: `${baseUrl}/${path}/${doc.id}`,
        lastModified: lastMod,
        changeFrequency: 'weekly',
        priority: 0.8,
      };
    });

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error("Erreur génération sitemap dynamique:", error);
    return staticRoutes;
  }
}
