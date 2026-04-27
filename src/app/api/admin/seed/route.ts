import { NextResponse } from 'next/server';
import { createListingAction } from '@/app/actions/listing';

export async function GET() {
  const hotels = [
    {
      id: 'hyatt-regency-algiers',
      ownerId: 'admin-stayfloow',
      category: 'accommodation',
      status: 'approved',
      partnerInfo: {
        firstName: 'Hyatt',
        lastName: 'Regency Algiers',
        email: 'algiers.regency@hyatt.com',
        phone: '+213 21 98 12 34',
      },
      location: { 
        address: 'Houari Boumediene Airport, Algiers 16000, Algérie' 
      },
      details: {
        name: 'Hyatt Regency Algiers Airport',
        type: 'Hôtel 5 étoiles',
        description: 'Le Hyatt Regency Algiers Airport est un hôtel contemporain situé face au nouveau terminal de l\'aéroport international Houari Boumediene. Idéal pour les voyageurs d\'affaires et de loisirs, il propose 320 chambres spacieuses, un centre de fitness ouvert 24h/24 et une piscine intérieure chauffée.',
        amenities: ['Wifi gratuit', 'Piscine', 'Fitness', 'Navette Aéroport', 'Restaurant', 'Business Center'],
        stars: 5
      },
      price: 22500,
      currency: 'DZD',
      photos: ['/images/listings/hyatt-regency.png'],
      rating: 4.8,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'hotel-el-aurassi',
      ownerId: 'admin-stayfloow',
      category: 'accommodation',
      status: 'approved',
      partnerInfo: {
        firstName: 'Direction',
        lastName: 'El Aurassi',
        email: 'contact@elaurassi.dz',
        phone: '+213 21 74 82 52',
      },
      location: { 
        address: '2 Boulevard Frantz Fanon, Alger 16000, Algérie' 
      },
      details: {
        name: 'Hôtel El Aurassi',
        type: 'Hôtel 5 étoiles (Palace)',
        description: 'L\'Hôtel El Aurassi est une icône de l\'hôtellerie algérienne. Perché sur les hauteurs d\'Alger, il offre une vue imprenable sur la baie. C\'est le lieu privilégié pour les rencontres diplomatiques et les séjours de prestige, alliant architecture imposante et service raffiné.',
        amenities: ['Vue sur mer', 'Piscine extérieure', 'Tennis', 'Parking gratuit', 'Restaurants gastronomiques', 'Salles de conférence'],
        stars: 5
      },
      price: 19000,
      currency: 'DZD',
      photos: ['/images/listings/el-aurassi.png'],
      rating: 4.6,
      createdAt: new Date().toISOString(),
    }
  ];

  const results = [];
  for (const hotel of hotels) {
    const res = await createListingAction(hotel as any);
    results.push({ id: hotel.id, success: res.success });
  }

  return NextResponse.json({ 
    message: "Seeding completed", 
    results 
  });
}
