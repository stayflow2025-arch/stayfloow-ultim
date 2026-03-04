import { config } from 'dotenv';
config();

import '@/ai/flows/partner-promo-text-suggester.ts';
import '@/ai/flows/partner-description-generator.ts';
import '@/ai/flows/price-recommendation-flow.ts';
import '@/ai/flows/user-recommendation-flow.ts';
import '@/ai/flows/customer-support-flow.ts';
