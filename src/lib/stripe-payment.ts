'use client';

/**
 * @fileOverview Utilitaire pour créer une session de paiement Stripe.
 * Appelle l'API Next.js /api/stripe/checkout pour créer la session côté serveur.
 */

export async function createStripeCheckout(
  amount: number,       // Montant total (ex: 16.80)
  currency: string,     // Devise (ex: "EUR")
  productName: string,  // Nom affiché sur Stripe
  successUrl: string,
  cancelUrl: string
): Promise<string | null> {
  try {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency, productName, successUrl, cancelUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la création de la session Stripe');
    }

    return data.url || null;
  } catch (err) {
    console.error('Erreur Stripe Checkout:', err);
    throw err;
  }
}
