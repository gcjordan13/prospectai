
'use server';

/**
 * @fileOverview Confirms the scope of prospecting goals through a conversational interface.
 *
 * - confirmProspectingScope - A function that confirms the scope of user's prospecting goals.
 * - ConfirmProspectingScopeInput - The input type for the confirmProspectingScope function.
 * - ConfirmProspectingScopeOutput - The return type for the confirmProspectingScope function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConfirmProspectingScopeInputSchema = z.object({
  userInput: z
    .string()
    .describe('The user input describing their prospecting goals.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).describe('The entire conversation history.'),
});
export type ConfirmProspectingScopeInput = z.infer<typeof ConfirmProspectingScopeInputSchema>;

const ConfirmProspectingScopeOutputSchema = z.object({
  assistantResponse: z.string().describe('The AI assistant\'s response, which could be a clarifying question or a confirmation of the scope.'),
  confirmedScope: z.string().optional().describe('The AI confirmed scope of the prospecting goals. This is only returned when the scope is clear.'),
  numberOfContacts: z.number().optional().describe('The number of contacts the user wants to find. Only returned when scope is confirmed.'),
});
export type ConfirmProspectingScopeOutput = z.infer<typeof ConfirmProspectingScopeOutputSchema>;

export async function confirmProspectingScope(input: ConfirmProspectingScopeInput): Promise<ConfirmProspectingScopeOutput> {
  return confirmProspectingScopeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'confirmProspectingScopePrompt',
  input: {
    schema: ConfirmProspectingScopeInputSchema,
  },
  output: {
    schema: ConfirmProspectingScopeOutputSchema,
  },
  prompt: `You are a prospecting assistant. Your goal is to help the user define their prospecting goals through a conversation.

Here is the conversation history:
{{#each conversationHistory}}
{{role}}: {{content}}
{{/each}}

Analyze the user's input from the last message in the conversation history.
- If the user's goal is FULLY clear (including industry, location, company size, AND number of contacts they want), summarize the goal as the 'confirmedScope', extract the number as 'numberOfContacts', and respond with a confirmation message in 'assistantResponse', like "Great! I'll find [numberOfContacts] contacts from [industry] companies in [location] with [size] employees. Does this sound right?".
- If ANY information is missing (industry, location, company size, OR number of contacts), ask clarifying questions in the 'assistantResponse'. For example:
  - If industry is missing: "What industry are you targeting?"
  - If number of contacts is missing: "How many contacts would you like me to find?"
- Do NOT provide a 'confirmedScope' or 'numberOfContacts' until ALL information is gathered.
- IMPORTANT: Only provide real, existing companies and contacts. Do not use placeholders or examples.