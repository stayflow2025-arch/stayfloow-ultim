import { config } from 'dotenv';
config();

import { generatePartnerDescription } from '../src/ai/flows/partner-description-generator';

async function test() {
  try {
    console.log("Calling generatePartnerDescription...");
    const result = await generatePartnerDescription({
      listingType: 'accommodation',
      listingName: 'Riad Test',
      location: 'Marrakech, Maroc',
      keyFeatures: ['Wi-Fi gratuit', 'Piscine'],
      existingDescription: 'Un joli riad.'
    });
    console.log("Result:", result);
  } catch (error) {
    console.error("Error caught in test:", error);
  }
}

test();
