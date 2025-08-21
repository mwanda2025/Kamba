'use server';
/**
 * @fileOverview AI-powered chat functionality to receive questions from user, reason using its tools to give intelligent responses in text and voice output, and support for multiple languages, focusing on Portuguese.
 *
 * - respondToUserQuery - A function that handles the user query and returns a response in text and voice.
 * - RespondToUserQueryInput - The input type for the respondToUserQuery function.
 * - RespondToUserQueryOutput - The return type for the respondToUserQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const RespondToUserQueryInputSchema = z.object({
  query: z.string().describe('The user query in Portuguese or English.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RespondToUserQueryInput = z.infer<typeof RespondToUserQueryInputSchema>;

const RespondToUserQueryOutputSchema = z.object({
  text: z.string().describe('The text response to the user query.'),
  audio: z.string().describe('The audio response to the user query in base64 WAV format.'),
});
export type RespondToUserQueryOutput = z.infer<typeof RespondToUserQueryOutputSchema>;

export async function respondToUserQuery(input: RespondToUserQueryInput): Promise<RespondToUserQueryOutput> {
  return respondToUserQueryFlow(input);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const respondToUserQueryFlow = ai.defineFlow(
  {
    name: 'respondToUserQueryFlow',
    inputSchema: RespondToUserQueryInputSchema,
    outputSchema: RespondToUserQueryOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
      model: input.photoDataUri ? 'googleai/gemini-pro-vision' : 'googleai/gemini-2.0-flash',
      prompt: `You are Kamba, an AI assistant specialized in providing information about Angola. Your persona is friendly, knowledgeable, and helpful. You always respond in Angolan Portuguese unless the user speaks in another language.
      {{#if photoDataUri}}
      The user has provided an image. Analyze the image and the user's query to provide a comprehensive response.
      Image: {{media url=photoDataUri}}
      {{/if}}

      User query: "{{query}}"
      
      Based on this query, provide a concise and helpful response.`,
      input: input,
    });
    const text = output?.text;

    if (!text) {
        throw new Error('No text returned from LLM');
    }

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: text,
    });

    if (!media) {
      throw new Error('no media returned');
    }

    const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
    );

    const audio = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {text, audio};
  }
);
