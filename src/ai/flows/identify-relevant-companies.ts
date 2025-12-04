'use server';

/**
 * @fileOverview An AI agent to identify relevant companies and websites based on prospecting goals.
 *
 * - identifyRelevantCompanies - A function that handles the identification process.
 * - IdentifyRelevantCompaniesInput - The input type for the identifyRelevantCompanies function.
 * - IdentifyRelevantCompaniesOutput - The return type for the identifyRelevantCompanies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyRelevantCompaniesInputSchema = z.object({
  prospectingGoals: z
    .string()
    .describe("The user's prospecting goals, including industry, location, and company size."),
});
export type IdentifyRelevantCompaniesInput = z.infer<
  typeof IdentifyRelevantCompaniesInputSchema
>;

const IdentifyRelevantCompaniesOutputSchema = z.object({
  companies: z
    .array(z.string())
    .describe('An array of relevant company names.'),
  websites: z.array(z.string()).describe('An array of relevant website URLs.'),
});
export type IdentifyRelevantCompaniesOutput = z.infer<
  typeof IdentifyRelevantCompaniesOutputSchema
>;

export async function identifyRelevantCompanies(
  input: IdentifyRelevantCompaniesInput
): Promise<IdentifyRelevantCompaniesOutput> {
  return identifyRelevantCompaniesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyRelevantCompaniesPrompt',
  input: {schema: IdentifyRelevantCompaniesInputSchema},
  output: {schema: IdentifyRelevantCompaniesOutputSchema},
  prompt: `Based on the following prospecting goals, identify relevant companies and their websites.

Prospecting Goals: {{{prospectingGoals}}}

Return the company names and website URLs in the specified JSON format.

Companies:
Websites:`,
});

const identifyRelevantCompaniesFlow = ai.defineFlow(
  {
    name: 'identifyRelevantCompaniesFlow',
    inputSchema: IdentifyRelevantCompaniesInputSchema,
    outputSchema: IdentifyRelevantCompaniesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
