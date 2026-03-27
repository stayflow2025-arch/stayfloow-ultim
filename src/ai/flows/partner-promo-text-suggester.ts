'use server';
/**
 * @fileOverview A Genkit flow for suggesting tailored promotional messages for partners on StayFloow.com.
 *
 * - suggestPromoText - A function that handles the promotional text suggestion process.
 * - PartnerPromoTextSuggesterInput - The input type for the suggestPromoText function.
 * - PartnerPromoTextSuggesterOutput - The return type for the suggestPromoText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PartnerPromoTextSuggesterInputSchema = z.object({
  listingType: z.string().describe('The type of listing (e.g., accommodation, car, circuit).'),
  offers: z.array(z.string()).describe('A list of offers or keywords related to the promotion (e.g., Flash Sale, Eid Discount, Ramadan Special).'),
  location: z.string().optional().describe('The location of the listing, if relevant for local events.'),
});
export type PartnerPromoTextSuggesterInput = z.infer<typeof PartnerPromoTextSuggesterInputSchema>;

const PartnerPromoTextSuggesterOutputSchema = z.object({
  suggestedMessage: z.string().describe('A tailored, engaging promotional message.'),
});
export type PartnerPromoTextSuggesterOutput = z.infer<typeof PartnerPromoTextSuggesterOutputSchema>;

export async function suggestPromoText(input: PartnerPromoTextSuggesterInput): Promise<PartnerPromoTextSuggesterOutput> {
  return partnerPromoTextSuggesterFlow(input);
}

const promoTextPrompt = ai.definePrompt({
  name: 'partnerPromoTextPrompt',
  input: {schema: PartnerPromoTextSuggesterInputSchema},
  output: {schema: PartnerPromoTextSuggesterOutputSchema},
  prompt: `You are an expert marketing copywriter for a travel and rental platform called StayFloow.com.

Your task is to generate a short, engaging, and tailored promotional message based on the provided listing type and offers. The message should be creative and compelling to attract customers to book via StayFloow.com.

Consider the following details:
Listing Type: {{{listingType}}}
Offers: {{#each offers}}- {{{this}}}{{/each}}
{{#if location}}Location: {{{location}}}{{/if}}

Generate a single promotional message. Focus on highlighting the benefit and creating urgency or excitement.

Example Output:
SuggestedMessage: "Vivez un séjour inoubliable pour l'Aïd ! Profitez de 20% de réduction sur toutes les chambres de notre riad à Marrakech. Réservez maintenant sur StayFloow.com !"

Now, generate the promotional message based on the input.`,
});

const partnerPromoTextSuggesterFlow = ai.defineFlow(
  {
    name: 'partnerPromoTextSuggesterFlow',
    inputSchema: PartnerPromoTextSuggesterInputSchema,
    outputSchema: PartnerPromoTextSuggesterOutputSchema,
  },
  async input => {
    const {output} = await promoTextPrompt(input);
    return output!;
  }
);
