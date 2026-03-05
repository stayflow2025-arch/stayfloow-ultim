
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
    const docRef = await addDoc(sessionsRef, {
      price: priceId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    // 2. Écouter le document jusqu'à ce que l'extension Stripe ajoute l'URL
    return new Promise<string>((resolve, reject) => {
      const unsubscribe = onSnapshot(docRef, (snap) => {
        const { error, url } = snap.data() as any;
        if (error) {
          unsubscribe();
          reject(new Error(`Stripe Error: ${error.message}`));
        }
        if (url) {
          unsubscribe();
          resolve(url); // On renvoie l'URL vers laquelle rediriger le client
        }
      });
    });
  } catch (err) {
    console.error("Erreur lors de la création de la session Stripe", err);
    throw err;
  }
}
