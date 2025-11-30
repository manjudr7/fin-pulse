'use server';

/**
 * @fileOverview A flow that recommends personalized credit card and loan offers based on the user's credit profile and financial goals.
 *
 * - recommendOffers - A function that handles the offer recommendation process.
 * - RecommendOffersInput - The input type for the recommendOffers function.
 * - RecommendOffersOutput - The return type for the recommendOffers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreditProfileSchema = z.object({
  creditScore: z.number().describe('The user credit score.'),
  paymentHistory: z.number().describe('Percentage of on-time payments.'),
  creditCardUse: z.number().describe('Credit card utilization ratio.'),
  derogatoryMarks: z.boolean().describe('Whether the user has any derogatory marks.'),
  creditAge: z.number().describe('The age of the user credit history in years.'),
  totalAccounts: z.number().describe('The total number of credit accounts.'),
  hardInquiries: z.number().describe('The number of hard inquiries in the last two years.'),
});

const FinancialGoalsSchema = z.object({
  goalType: z.string().describe('The type of financial goal (e.g., debt consolidation, home improvement).'),
  goalAmount: z.number().describe('The amount needed to achieve the goal.'),
  timeline: z.string().describe('The timeline to achieve the goal (e.g., 6 months, 1 year).'),
});

const OfferSchema = z.object({
  title: z.string().describe('The title of the offer.'),
  type: z.string().describe('The type of offer (e.g., credit card, loan).'),
  bank: z.string().describe('The bank offering the product.'),
  tags: z.array(z.string()).describe('Tags associated with the offer (e.g., pre-approved, best match).'),
  rate: z.number().describe('The interest rate of the offer.'),
  annualFee: z.number().describe('The annual fee of the offer.'),
  keyBenefits: z.string().describe('The key benefits of the offer.'),
  eligibilityRules: z.string().describe('The eligibility rules for the offer.'),
  partnerLink: z.string().describe('The link to apply for the offer.'),
});

const RecommendOffersInputSchema = z.object({
  creditProfile: CreditProfileSchema.describe('The user credit profile.'),
  financialGoals: FinancialGoalsSchema.describe('The user financial goals.'),
  availableOffers: z.array(OfferSchema).describe('A list of available offers to choose from.'),
});

export type RecommendOffersInput = z.infer<typeof RecommendOffersInputSchema>;

const RecommendOffersOutputSchema = z.array(OfferSchema);

export type RecommendOffersOutput = z.infer<typeof RecommendOffersOutputSchema>;

export async function recommendOffers(input: RecommendOffersInput): Promise<RecommendOffersOutput> {
  return recommendOffersFlow(input);
}

const filterOffers = ai.defineTool({
  name: 'filterOffers',
  description: 'Filters a list of offers based on a user credit profile and financial goals.',
  inputSchema: z.object({
    offers: z.array(OfferSchema).describe('The offers to filter.'),
    creditScore: z.number().describe('The users credit score'),
    financialGoal: z.string().describe('The users financial goal'),
  }),
  outputSchema: z.array(OfferSchema),
}, async (input) => {
  // This is a placeholder implementation.  In a real application, this function would
  // use the credit profile and financial goals to filter the available offers and
  // return only the most relevant ones.
  //
  // For now, we just return the first 3 offers.
  return input.offers.slice(0, 3);
});

const prompt = ai.definePrompt({
  name: 'recommendOffersPrompt',
  input: {schema: RecommendOffersInputSchema},
  output: {schema: RecommendOffersOutputSchema},
  tools: [filterOffers],
  prompt: `You are a financial advisor recommending credit card and loan offers to a user.

  Based on the user's credit profile and financial goals, select the best offers from the list of available offers.
  Credit Profile: {{json creditProfile}}
  Financial Goals: {{json financialGoals}}
  Available Offers: {{json availableOffers}}
  
  Consider the user's credit score, payment history, credit card use, derogatory marks, credit age, total accounts, and hard inquiries.
  Also, consider the user's financial goals, including the type of goal, the amount needed, and the timeline to achieve the goal.
  
  Use the filterOffers tool to narrow down the available offers to the most relevant ones. The creditScore is {{{creditProfile.creditScore}}} and the financialGoal is {{{financialGoals.goalType}}}.
  
  Return a JSON array of the recommended offers.
  `,
});

const recommendOffersFlow = ai.defineFlow(
  {
    name: 'recommendOffersFlow',
    inputSchema: RecommendOffersInputSchema,
    outputSchema: RecommendOffersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
