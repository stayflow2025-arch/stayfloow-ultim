import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const secret = process.env.STAYFLOOW_PROSPECTS_SECRET;

    // Si on a configuré un secret et que le header ne correspond pas
    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = await req.json();

    const { name, email, phone, location, sourcePlatform, propertyLink, type } = payload;

    if (!name || (!email && !phone)) {
      return NextResponse.json({ error: 'Nom et (Email ou Téléphone) requis' }, { status: 400 });
    }

    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { initializeFirebase } = await import('@/firebase');
      
      const { firestore } = initializeFirebase();
      
      if (!firestore) {
        throw new Error("Firestore non initialisé sur le serveur.");
      }

      const newProspect = {
        name,
        email: email || '',
        phone: phone || '',
        location: location || '',
        sourcePlatform: sourcePlatform || 'Inconnu',
        propertyLink: propertyLink || '',
        type: type || 'Autre',
        status: 'Nouveau',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(firestore, 'prospects'), newProspect);

      return NextResponse.json({ 
        success: true, 
        id: docRef.id, 
        message: "Prospect enregistré avec succès" 
      }, { status: 201 });

    } catch (firebaseError: any) {
      console.error("[Webhook] Erreur Firebase détaillée:", firebaseError);
      return NextResponse.json({ 
        success: false, 
        error: "Erreur de base de données Firebase",
        details: firebaseError.message 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Erreur Webhook Prospects:', error);
    return NextResponse.json({ error: 'Erreur interne', details: error.message }, { status: 500 });
  }
}
