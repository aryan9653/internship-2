'use server';

/**
 * @fileOverview Summarizes the content of a file given its data URI.
 *
 * - summarizeFileContent - A function that summarizes the content of a file.
 * - SummarizeFileContentInput - The input type for the summarizeFileContent function.
 * - SummarizeFileContentOutput - The return type for the summarizeFileContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeFileContentInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The file's content as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeFileContentInput = z.infer<typeof SummarizeFileContentInputSchema>;

const SummarizeFileContentOutputSchema = z.object({
  summary: z.string().describe('A concise, bullet-point summary of the file content.'),
});
export type SummarizeFileContentOutput = z.infer<typeof SummarizeFileContentOutputSchema>;

export async function summarizeFileContent(input: SummarizeFileContentInput): Promise<SummarizeFileContentOutput> {
  return summarizeFileContentFlow(input);
}

const summarizeFileContentPrompt = ai.definePrompt({
  name: 'summarizeFileContentPrompt',
  input: {schema: SummarizeFileContentInputSchema},
  output: {schema: SummarizeFileContentOutputSchema},
  prompt: `You are a summarization expert.  Please summarize the content of the following document in a concise, bullet-point format.\n\nContent: {{media url=fileDataUri}}`,
});

const summarizeFileContentFlow = ai.defineFlow(
  {
    name: 'summarizeFileContentFlow',
    inputSchema: SummarizeFileContentInputSchema,
    outputSchema: SummarizeFileContentOutputSchema,
  },
  async input => {
    const {output} = await summarizeFileContentPrompt(input);
    return output!;
  }
);
