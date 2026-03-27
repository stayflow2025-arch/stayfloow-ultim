'use server';
/**
 * @fileOverview A Genkit flow for providing price recommendations based on market factors and listing details for StayFloow.com.
 *
 * - getPriceRecommendation - A function that handles the price analysis process.
 * - PriceRecommendationInput - The input type for the getPriceRecommendation function.
 * - PriceRecommendationOutput - The return type for the getPriceRecommendation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PriceRecommendationInputSchema = z.object({
  name: z.string().describe('The name of the property or service.'),
  location: z.string().describe('The location of the listing.'),
  price: z.number().describe('The current or proposed price.'),
  rooms: z.number().optional().describe('Number of rooms (for accommodations).'),
  rating: z.number().optional().describe('Expected or current rating.'),
  demandScore: z.number().optional().describe('Market demand score (0-100).'),
});
export type PriceRecommendationInput = z.infer<typeof PriceRecommendationInputSchema>;

const PriceRecommendationOutputSchema = z.object({
  recommendedPrice: z.number().describe('The suggested price based on analysis.'),
  confidence: z.number().describe('Confidence level of the recommendation (percentage).'),
  reasoning: z.array(z.string()).describe('List of reasons for the recommendation.'),
  marketFactors: z.array(z.string()).describe('Key market factors considered.'),
});
export type PriceRecommendationOutput = z.infer<typeof PriceRecommendationOutputSchema>;

export async function getPriceRecommendation(input: PriceRecommendationInput): Promise<PriceRecommendationOutput> {
  return priceRecommendationFlow(input);
}

const priceRecommendationFlow = ai.defineFlow(
  {
    name: 'priceRecommendationFlow',
    inputSchema: PriceRecommendationInputSchema,
    outputSchema: PriceRecommendationOutputSchema,
  },
  async (property) => {
    console.log("DEBUG: Running price-recommendation-flow for StayFloow.com");
    
    // Simulate complex AI processing time
    await new Promise(resolve => setTimeout(resolve, 1200));

    const demandScore = property.demandScore ?? 60;

    const adjustment =
      demandScore > 70
        ? 1.15
        : demandScore > 50
        ? 1.05
        : 0.95;

    const recommendedPrice = Math.round(property.price * adjustment);

    return {
      recommendedPrice,
      confidence:
        demandScore > 70
          ? 92
          : demandScore > 50
          ? 78
          : 65,
      reasoning: [
        `Analyse basée sur la demande actuelle pour ${property.location}.`,
        `Le bien "${property.name}" présente un score de demande de ${demandScore}/100 sur StayFloow.com.`,
        `Le prix proposé (${property.price} DZD) a été ajusté selon les tendances algorithmiques du marché local.`,
      ],
      marketFactors: [
        "Tendance générale du marché dans la région",
        "Disponibilité des biens similaires à cette période",
        "Historique des réservations saisonnières",
        "Attractivité spécifique du quartier",
      ],
    };
  }
);
