
'use server';

import { confirmProspectingScope, ConfirmProspectingScopeInput, ConfirmProspectingScopeOutput } from "@/ai/flows/confirm-prospecting-scope";
import { identifyRelevantCompanies, IdentifyRelevantCompaniesInput, IdentifyRelevantCompaniesOutput } from "@/ai/flows/identify-relevant-companies";

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

// The server action now returns only what the AI generates.
// The client will be responsible for managing the conversation history state.
export type GetAiResponseOutput = ConfirmProspectingScopeOutput;

export async function getAiResponse(
  input: ConfirmProspectingScopeInput
): Promise<GetAiResponseOutput> {
  if (!input.userInput) {
    throw new Error('User input cannot be empty.');
  }

  try {
    // The flow now receives the user input and the history separately
    // and is responsible for combining them.
    const response = await confirmProspectingScope(input);
    return response;

  } catch (error) {
    console.error('Error in getAiResponse:', error);
    const errorMessage = "I'm sorry, I encountered an error. Could you please rephrase your request?";
    
    // On error, we still return the standard output shape, but with an error message.
    return {
      assistantResponse: errorMessage,
      confirmedScope: undefined,
    };
  }
}

export async function findCompanies(
  input: IdentifyRelevantCompaniesInput
): Promise<IdentifyRelevantCompaniesOutput> {
  if (!input.prospectingGoals) {
    throw new Error('Prospecting goals cannot be empty.');
  }
  
  try {
    const response = await identifyRelevantCompanies(input);
    return response;

  } catch (error) {
    console.error('Error in findCompanies:', error);
    throw new Error("Failed to identify companies. Please try again.");
  }
}
