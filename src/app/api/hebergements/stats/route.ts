
import { NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getFirestore } from '@/firebase';

export async function GET() {
  try {
    const db = getFirestore();
    const listingsRef = collection(db, 'listings');
    const q = query(
      listingsRef, 
      where('category', '==', 'accommodation'),
      where('status', '==', 'approved')
    );
    const snapshot = await getDocs(q);
    
    const stats = {
      ratings: { "9+": 0, "8+": 0, "7+": 0, "6+": 0 },
      amenities: {} as Record<string, number>
    };

    const targetAmenities = [
      "Wi-Fi gratuit",
      "Piscine",
      "Climatisation",
      "Parking gratuit",
      "Petit-déjeuner inclus",
      "Vue mer",
      "Cuisine équipée",
      "Restaurant sur place",
      "Réception 24h/24",
      "Animaux domestiques acceptés",
      "Terrasse / balcon / vue",
      "Salle de bain privée"
    ];

    targetAmenities.forEach(a => stats.amenities[a] = 0);

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const rating = data.rating || 0;
      const ams = data.details?.amenities || [];

      if (rating >= 9) stats.ratings["9+"]++;
      if (rating >= 8) stats.ratings["8+"]++;
      if (rating >= 7) stats.ratings["7+"]++;
      if (rating >= 6) stats.ratings["6+"]++;

      targetAmenities.forEach(a => {
        if (ams.includes(a)) stats.amenities[a]++;
      });
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats Error:", error);
    return NextResponse.json({ error: "Erreur lors du calcul des stats" }, { status: 500 });
  }
}
