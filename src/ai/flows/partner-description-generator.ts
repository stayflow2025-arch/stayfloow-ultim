'use server';
/**
 * @fileOverview A Genkit flow for generating or enhancing compelling, detailed, and SEO-friendly descriptions for partner listings.
 *
 * - generatePartnerDescription - A function that handles the description generation process.
 * - PartnerDescriptionGeneratorInput - The input type for the generatePartnerDescription function.
 * - PartnerDescriptionGeneratorOutput - The return type for the generatePartnerDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PartnerDescriptionGeneratorInputSchema = z.object({
  listingType: z.enum(['accommodation', 'car_rental', 'circuit']).describe('The type of listing (accommodation, car_rental, or circuit).'),
  listingName: z.string().min(1).describe('The name of the listing.'),
  location: z.string().min(1).describe('The location of the listing (e.g., city, region).'),
  keyFeatures: z.array(z.string().min(1)).min(1).describe('An array of key features and amenities of the listing.'),
  existingDescription: z.string().optional().describe('An optional existing description to be enhanced.'),
});
export type PartnerDescriptionGeneratorInput = z.infer<typeof PartnerDescriptionGeneratorInputSchema>;

const PartnerDescriptionGeneratorOutputSchema = z.object({
  generatedDescription: z.string().describe('The generated or enhanced compelling and SEO-friendly description for the listing.'),
});
export type PartnerDescriptionGeneratorOutput = z.infer<typeof PartnerDescriptionGeneratorOutputSchema>;

export async function generatePartnerDescription(input: PartnerDescriptionGeneratorInput): Promise<PartnerDescriptionGeneratorOutput> {
  return partnerDescriptionGeneratorFlow(input);
}

const partnerDescriptionPrompt = ai.definePrompt({
  name: 'partnerDescriptionPrompt',
  input: { schema: PartnerDescriptionGeneratorInputSchema },
  output: { schema: PartnerDescriptionGeneratorOutputSchema },
  prompt: `You are an expert copywriter for a travel and rental platform called StayFloow.com. Your goal is to create compelling, detailed, and SEO-friendly descriptions for various types of listings to attract customers.

Based on the following information, generate a new description or enhance the provided existing description. The description should be between 150 and 300 words.

Listing Type: {{{listingType}}}
Listing Name: {{{listingName}}}
Location: {{{location}}}
Key Features:
{{#each keyFeatures}}- {{{this}}}
{{/each}}
{{#if existingDescription}}
Existing Description to Enhance:
{{{existingDescription}}}
{{/if}}

Your task is to write a captivating and informative description that highlights the unique selling points, features, and experiences associated with this listing on StayFloow.com. Use a tone that is inviting and professional. Ensure the description is rich in detail and naturally incorporates relevant keywords for search engine optimization. Output the final description in the 'generatedDescription' field.`,
});

const partnerDescriptionGeneratorFlow = ai.defineFlow(
  {
    name: 'partnerDescriptionGeneratorFlow',
    inputSchema: PartnerDescriptionGeneratorInputSchema,
    outputSchema: PartnerDescriptionGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await partnerDescriptionPrompt(input);
    return output!;
  }
);
