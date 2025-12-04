
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
  })).optional().default([]),
});
export type ConfirmProspectingScopeInput = z.infer<typeof ConfirmProspectingScopeInputSchema>;

const ConfirmProspectingScopeOutputSchema = z.object({
  assistantResponse: z.string().describe('The AI assistant\'s response, which could be a clarifying question or a confirmation of the scope.'),
  confirmedScope: z.string().optional().describe('The AI confirmed scope of the prospecting goals. This is only returned when the scope is clear.'),
});
export type ConfirmProspectingScopeOutput = z.infer<typeof ConfirmProspectingScopeOutputSchema>;

export async function confirmProspectingScope(input: ConfirmProspectingScopeInput): Promise<ConfirmProspectingScopeOutput> {
  return confirmProspectingScopeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'confirmProspectingScopePrompt',
  input: {
    schema: z.object({
      formattedHistory: z.string().describe('The formatted conversation history'),
    })
  },
  output: {
    schema: ConfirmProspectingScopeOutputSchema,
  },
  prompt: `You are a prospecting assistant. Your goal is to help the user define their prospecting goals through a conversation.

Here is the conversation history:
{{{formattedHistory}}}

Analyze the user's input from the last message in the conversation history.
- If the user's goal is clear (including industry, location, and company size), summarize the goal as the 'confirmedScope' and respond with a confirmation message in 'assistantResponse', like "Great! Here is a summary of your goal: [summary]. Does this sound right?".
- If the goal is not clear, ask clarifying questions in the 'assistantResponse'. For example, if the industry is missing, ask "What industry are you targeting?". Do not provide a 'confirmedScope' in this case.

Assistant:`,
});

const confirmProspectingScopeFlow = ai.defineFlow(
  {
    name: 'confirmProspectingScopeFlow',
    inputSchema: ConfirmProspectingScopeInputSchema,
    outputSchema: ConfirmProspectingScopeOutputSchema,
  },
  async input => {
    // Build the full conversation history including the new user input
    const fullHistory = [
        ...input.conversationHistory,
        { role: 'user' as const, content: input.userInput }
    ];

    // Format the conversation history as a string to avoid Handlebars template issues
    const formattedHistory = fullHistory
      .map(msg => msg.role === 'user' ? `User: ${msg.content}` : `Assistant: ${msg.content}`)
      .join('\n');

    const {output} = await prompt({ formattedHistory });

    return output!;
  }
);
