'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a chat title based on the conversation history.
 *
 * - `generateChatTitle` - A function that handles the title generation process.
 * - `GenerateChatTitleInput` - The input type for the `generateChatTitle` function.
 * - `GenerateChatTitleOutput` - The return type for the `generateChatTitle` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChatTitleInputSchema = z.object({
  conversationHistory: z
    .string()
    .describe('The history of the conversation as a single string.'),
});
export type GenerateChatTitleInput = z.infer<typeof GenerateChatTitleInputSchema>;

const GenerateChatTitleOutputSchema = z.object({
  title: z.string().describe('A short, concise title for the conversation.'),
});
export type GenerateChatTitleOutput = z.infer<typeof GenerateChatTitleOutputSchema>;

export async function generateChatTitle(input: GenerateChatTitleInput): Promise<GenerateChatTitleOutput> {
  return generateChatTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChatTitlePrompt',
  input: {schema: GenerateChatTitleInputSchema},
  output: {schema: GenerateChatTitleOutputSchema},
  prompt: `Based on the following conversation history, generate a short, concise title (3-5 words) in Portuguese for the chat.

Conversation History:
{{conversationHistory}}

The title should summarize the main topic of the conversation. Do not include "Conversa sobre" or any similar prefix.
`,
});

const generateChatTitleFlow = ai.defineFlow(
  {
    name: 'generateChatTitleFlow',
    inputSchema: GenerateChatTitleInputSchema,
    outputSchema: GenerateChatTitleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
