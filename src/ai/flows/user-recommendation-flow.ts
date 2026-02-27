'use server';
/**
 * @fileOverview Un agent IA expert StayFloow qui recommande des services basés sur le catalogue réel du site.
 *
 * - tailorRecommendationsViaUI - Gère la logique de recommandation intelligente.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RecommendationInputSchema = z.object({
  userPreferences: z.string().describe('Préférences sélectionnées par l\'utilisateur.'),
  recommendationToolEnabled: z.boolean().describe('Si l\'analyse avancée est activée.'),
  pastBookings: z.string().optional().describe('Historique des réservations passées.'),
  travelerProfiles: z.string().optional().describe('Profil du voyageur.'),
  siteContext: z.string().optional().describe('Données réelles extraites du site (hébergements, voitures, circuits).'),
});

export type RecommendationInput = z.infer<typeof RecommendationInputSchema>;

const RecommendationOutputSchema = z.object({
  response: z.string().describe('La réponse personnalisée et détaillée générée par l\'IA.'),
});

export type RecommendationOutput = z.infer<typeof RecommendationOutputSchema>;

const recommendationPrompt = ai.definePrompt({
  name: 'recommendationPrompt',
  input: { schema: RecommendationInputSchema },
  output: { schema: RecommendationOutputSchema },
  prompt: `Tu es l'Expert Voyage de StayFloow.com. Ton rôle est d'aider les clients à trouver le séjour parfait en Algérie ou en Égypte.

Voici les informations dont tu disposes :
- Préférences client : {{{userPreferences}}}
- Profil : {{{travelerProfiles}}}
- Historique : {{{pastBookings}}}

CONTEXTE DU SITE (Offres réelles) :
{{{siteContext}}}

INSTRUCTIONS :
1. Analyse les préférences du client et compare-les avec les offres réelles du site fournies dans le contexte.
2. Si le client demande des détails sur la "composition" (nombre de chambres, salles de bain, équipements), utilise les données du contexte pour répondre précisément.
3. Sois chaleureux, professionnel et incite à la réservation sur StayFloow.com.
4. Si aucune offre ne correspond parfaitement, suggère l'option la plus proche en expliquant pourquoi.
5. Garde tes réponses structurées avec des points clés.

Réponds directement au client.`,
});

export async function tailorRecommendationsViaUI(input: RecommendationInput): Promise<RecommendationOutput> {
  return tailorRecommendationsFlow(input);
}

const tailorRecommendationsFlow = ai.defineFlow(
  {
    name: 'tailorRecommendationsFlow',
    inputSchema: RecommendationInputSchema,
    outputSchema: RecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await recommendationPrompt(input);
    return output!;
  }
);
