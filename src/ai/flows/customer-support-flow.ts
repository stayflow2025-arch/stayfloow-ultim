'use server';
/**
 * @fileOverview Agent de support client IA pour StayFloow.com.
 * Gère les questions sur les réservations (ID commençant par ST) et les services du site.
 *
 * - chatWithSupport - Fonction principale pour dialoguer avec l'IA.
 * - SupportInput - Type d'entrée (message, historique, id réservation).
 * - SupportOutput - Type de sortie (réponse textuelle).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SupportInputSchema = z.object({
  message: z.string().describe('Le message actuel de l\'utilisateur.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string()
  })).optional().describe('L\'historique de la conversation pour le contexte.'),
  reservationId: z.string().optional().describe('L\'identifiant de réservation si connu (ex: ST8451).'),
});

export type SupportInput = z.infer<typeof SupportInputSchema>;

const SupportOutputSchema = z.object({
  response: z.string().describe('La réponse générée par l\'IA.'),
});

export type SupportOutput = z.infer<typeof SupportOutputSchema>;

/**
 * Appelle l'IA de support client StayFloow.
 */
export async function chatWithSupport(input: SupportInput): Promise<SupportOutput> {
  return customerSupportFlow(input);
}

const customerSupportFlow = ai.defineFlow(
  {
    name: 'customerSupportFlow',
    inputSchema: SupportInputSchema,
    outputSchema: SupportOutputSchema,
  },
  async (input) => {
    const { message, history, reservationId } = input;

    const systemPrompt = `Tu es l'Assistant Virtuel Expert de StayFloow.com. 
Ton rôle est d'aider les clients dans l'organisation de leurs voyages en Afrique (Algérie, Égypte, Maroc).

CONNAISSANCES DU SITE :
- Produits : Hébergements (Hôtels, Riads, Villas, Appartements), Location de voitures (SUV, Berlines, Économiques), et Circuits guidés (Sahara, Pyramides, Mer Rouge).
- Réservations : Les numéros de réservation commencent TOUJOURS par "ST" suivi de 4 chiffres (ex: ST8451, ST7319, ST1122).
- Politique d'annulation : Gratuite jusqu'à 48h avant le début de la prestation pour la plupart des offres.
- Paiement : Sécurisé via StayFloow Pay (Carte ou PayPal). Pas de prépaiement requis pour beaucoup d'offres.

TES MISSIONS :
1. Si l'utilisateur donne un numéro de réservation (format STXXXX), confirme que tu prends note de cette référence.
2. Réponds aux questions sur les équipements (Wi-Fi, clim, parking) et services (guide, assurance).
3. Oriente les clients vers leur "Portail Client" pour gérer leurs réservations existantes.
4. En cas de litige ou de question trop complexe, suggère de contacter le support humain via WhatsApp ou stayflow2025@gmail.com.

TON TON :
Chaleureux, professionnel, rassurant et concis.

CONTEXTE DE LA SESSION :
${reservationId ? `Référence client détectée : ${reservationId}` : 'Aucune référence ST spécifique fournie pour le moment.'}

Réponds maintenant au message de l'utilisateur.`;

    const { output } = await ai.generate({
      system: systemPrompt,
      messages: history?.map(h => ({
        role: h.role,
        content: [{ text: h.content }]
      })) || [],
      prompt: message,
    });

    return { response: output?.text || "Je suis désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer." };
  }
);
