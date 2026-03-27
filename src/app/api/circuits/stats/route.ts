import { NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getFirestore } from '@/firebase';

export async function GET() {
  try {
    const db = getFirestore();
    const listingsRef = collection(db, 'listings');
    const q = query(
      listingsRef, 
      where('category', '==', 'circuit'),
      where('status', '==', 'approved')
    );
    const snapshot = await getDocs(q);
    
    const stats = {
      ratings: { "9+": 0, "8+": 0, "7+": 0, "6+": 0 },
      options: {} as Record<string, number>
    };

    const optionsList = [
      "Guide inclus (local arabe/français)", "Repas inclus (halal)", "Transport 4x4 (désert)",
      "Durée 1 jour", "Durée multi-jours (2-7 jours)", "Annulation gratuite",
      "Langue arabe", "Langue français", "Thème désert/Sahara",
      "Thème culturel/historique (pyramides, ruines)", "Thème Nil/croisière",
      "Groupe petit (max 10 pers)", "Assurance incluse",
      "Départ depuis aéroport (Alger/Caire)", "Rating guide 8+"
    ];

    optionsList.forEach(o => stats.options[o] = 0);

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const rating = data.guideRating || 0;
      const ams = data.details?.amenities || [];

      if (rating >= 9) stats.ratings["9+"]++;
      if (rating >= 8) stats.ratings["8+"]++;
      if (rating >= 7) stats.ratings["7+"]++;
      if (rating >= 6) stats.ratings["6+"]++;

      optionsList.forEach(o => {
        if (ams.includes(o)) stats.options[o]++;
      });
    });

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Erreur stats circuits" }, { status: 500 });
  }
}
