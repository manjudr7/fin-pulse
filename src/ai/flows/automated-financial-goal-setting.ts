'use server';

/**
 * @fileOverview A flow for setting realistic financial goals and providing step-by-step guidance.
 *
 * - automatedFinancialGoalSetting - A function that handles the goal-setting process.
 * - AutomatedFinancialGoalSettingInput - The input type for the automatedFinancialGoalSetting function.
 * - AutomatedFinancialGoalSettingOutput - The return type for the automatedFinancialGoalSetting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedFinancialGoalSettingInputSchema = z.object({
  creditScore: z
    .number()
    .describe('The user credit score, which is an integer between 300 and 850'),
  income: z.number().describe('The user monthly income'),
  expenses: z.number().describe('The user monthly expenses'),
  financialGoals: z
    .string()
    .describe(
      'A comma separated list of financial goals the user wants to achieve'
    ),
});
export type AutomatedFinancialGoalSettingInput = z.infer<
  typeof AutomatedFinancialGoalSettingInputSchema
>;

const AutomatedFinancialGoalSettingOutputSchema = z.object({
  suggestedGoals: z.array(z.string()).describe('The suggested financial goals'),
  stepByStepGuidance: z
    .string()
    .describe('Step-by-step guidance to achieve the goals'),
});
export type AutomatedFinancialGoalSettingOutput = z.infer<
  typeof AutomatedFinancialGoalSettingOutputSchema
>;

export async function automatedFinancialGoalSetting(
  input: AutomatedFinancialGoalSettingInput
): Promise<AutomatedFinancialGoalSettingOutput> {
  return automatedFinancialGoalSettingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedFinancialGoalSettingPrompt',
  input: {schema: AutomatedFinancialGoalSettingInputSchema},
  output: {schema: AutomatedFinancialGoalSettingOutputSchema},
  prompt: `You are a financial advisor helping users to set realistic financial goals and providing step-by-step guidance to achieve them.

  Based on the user's credit score, income, and expenses, provide personalized and achievable financial goals.
  Also provide clear and actionable step-by-step guidance to achieve those goals.

  User Credit Score: {{{creditScore}}}
  User Monthly Income: {{{income}}}
  User Monthly Expenses: {{{expenses}}}
  User Financial Goals: {{{financialGoals}}}

  Format the output as a JSON object with "suggestedGoals" and "stepByStepGuidance" fields.
  The "suggestedGoals" field should be a JSON array of strings.
  The "stepByStepGuidance" field should be a string with clear, actionable steps.
  `,
});

const automatedFinancialGoalSettingFlow = ai.defineFlow(
  {
    name: 'automatedFinancialGoalSettingFlow',
    inputSchema: AutomatedFinancialGoalSettingInputSchema,
    outputSchema: AutomatedFinancialGoalSettingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
