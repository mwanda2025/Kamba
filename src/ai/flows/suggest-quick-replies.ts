'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting quick reply options based on the current conversation context.
 *
 * The flow takes the conversation history as input and returns a list of suggested quick replies.
 * - `suggestQuickReplies` - A function that handles the quick reply suggestion process.
 * - `SuggestQuickRepliesInput` - The input type for the `suggestQuickReplies` function.
 * - `SuggestQuickRepliesOutput` - The return type for the `suggestQuickReplies` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestQuickRepliesInputSchema = z.object({
  conversationHistory: z
    .string()
    .describe('The history of the conversation as a single string.'),
});
export type SuggestQuickRepliesInput = z.infer<typeof SuggestQuickRepliesInputSchema>;

const SuggestQuickRepliesOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested quick reply options.'),
});
export type SuggestQuickRepliesOutput = z.infer<typeof SuggestQuickRepliesOutputSchema>;

export async function suggestQuickReplies(input: SuggestQuickRepliesInput): Promise<SuggestQuickRepliesOutput> {
  return suggestQuickRepliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestQuickRepliesPrompt',
  input: {schema: SuggestQuickRepliesInputSchema},
  output: {schema: SuggestQuickRepliesOutputSchema},
  prompt: `You are a helpful AI assistant that suggests quick reply options based on the current conversation context.

  The user has provided the following conversation history:
  {{conversationHistory}}

  Based on this conversation history, suggest two quick reply options that the user can choose from to continue the conversation.
  Return the suggestions as a JSON array of strings. Do not include any other text in your response.`,
});

const suggestQuickRepliesFlow = ai.defineFlow(
  {
    name: 'suggestQuickRepliesFlow',
    inputSchema: SuggestQuickRepliesInputSchema,
    outputSchema: SuggestQuickRepliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
