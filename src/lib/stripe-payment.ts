
'use client';

import { collection, addDoc, onSnapshot, Firestore } from 'firebase/firestore';

/**
 * @fileOverview Utilitaire pour créer une session de paiement Stripe.
 * L'extension Firebase surveille la collection 'checkout_sessions' et génère l'URL de paiement.
 */

export async function createStripeCheckout(
  db: Firestore, 
  userId: string, 
  priceId: string, 
  successUrl: string, 
  cancelUrl: string
) {
  try {
    const sessionsRef = collection(db, 'customers', userId, 'checkout_sessions');
    
    // 1. Ajouter un document pour demander une session
    // On utilise un timeout court pour ne pas bloquer l'utilisateur si l'extension met trop de temps
    const docRef = await addDoc(sessionsRef, {
      price: priceId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    // 2. Écouter le document jusqu'à ce que l'extension Stripe ajoute l'URL
    return new Promise<string | null>((resolve, reject) => {
      // Sécurité : Timeout après 5 secondes si l'extension ne répond pas
      const timeoutId = setTimeout(() => {
        unsubscribe();
        resolve(null); // On retourne null pour passer en mode direct/manuel
      }, 5000);

      const unsubscribe = onSnapshot(docRef, (snap) => {
        const data = snap.data();
        if (!data) return;

        const { error, url } = data as any;
        
        if (error) {
          clearTimeout(timeoutId);
          unsubscribe();
          reject(new Error(`Stripe Error: ${error.message}`));
        }
        
        if (url) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(url); 
        }
      });
    });
  } catch (err) {
    console.error("Erreur lors de la création de la session Stripe", err);
    throw err;
  }
}
