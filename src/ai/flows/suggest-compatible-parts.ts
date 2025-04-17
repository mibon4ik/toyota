'use server';
/**
 * @fileOverview An AI agent that suggests compatible auto parts based on vehicle make and model.
 *
 * - suggestCompatibleParts - A function that handles the suggestion of compatible parts.
 * - SuggestCompatiblePartsInput - The input type for the suggestCompatibleParts function.
 * - SuggestCompatiblePartsOutput - The return type for the suggestCompatibleParts function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {AutoPart, searchAutoParts} from '@/services/autoparts';

const SuggestCompatiblePartsInputSchema = z.object({
  make: z.string().describe('The make of the vehicle.'),
  model: z.string().describe('The model of the vehicle.'),
});
export type SuggestCompatiblePartsInput = z.infer<typeof SuggestCompatiblePartsInputSchema>;

const SuggestCompatiblePartsOutputSchema = z.object({
  compatibleParts: z.array(
    z.object({
      id: z.string().describe('The ID of the part.'),
      name: z.string().describe('The name of the part.'),
      brand: z.string().describe('The brand of the part.'),
      price: z.number().describe('The price of the part.'),
      imageUrl: z.string().describe('The URL of the part image.'),
      description: z.string().describe('A description of the part.'),
      category: z.string().describe('The category of the part.'),
      compatibleVehicles: z.array(z.string()).describe('The vehicles that are compatible with the part.'),
    })
  ).describe('A list of compatible auto parts.'),
});
export type SuggestCompatiblePartsOutput = z.infer<typeof SuggestCompatiblePartsOutputSchema>;

export async function suggestCompatibleParts(input: SuggestCompatiblePartsInput): Promise<SuggestCompatiblePartsOutput> {
  return suggestCompatiblePartsFlow(input);
}

const partSearchTool = ai.defineTool({
  name: 'searchAutoParts',
  description: 'Search for auto parts based on a query.',
  inputSchema: z.object({
    query: z.string().describe('The search query to use to find auto parts.'),
  }),
  outputSchema: z.array(z.object({
    id: z.string().describe('The ID of the part.'),
    name: z.string().describe('The name of the part.'),
    brand: z.string().describe('The brand of the part.'),
    price: z.number().describe('The price of the part.'),
    imageUrl: z.string().describe('The URL of the part image.'),
    description: z.string().describe('A description of the part.'),
    category: z.string().describe('The category of the part.'),
    compatibleVehicles: z.array(z.string()).describe('The vehicles that are compatible with the part.'),
  })),
}, async (input) => {
  return await searchAutoParts(input.query);
});

const prompt = ai.definePrompt({
  name: 'suggestCompatiblePartsPrompt',
  tools: [partSearchTool],
  input: {
    schema: z.object({
      make: z.string().describe('The make of the vehicle.'),
      model: z.string().describe('The model of the vehicle.'),
    }),
  },
  output: {
    schema: z.object({
      compatibleParts: z.array(
        z.object({
          id: z.string().describe('The ID of the part.'),
          name: z.string().describe('The name of the part.'),
          brand: z.string().describe('The brand of the part.'),
          price: z.number().describe('The price of the part.'),
          imageUrl: z.string().describe('The URL of the part image.'),
          description: z.string().describe('A description of the part.'),
          category: z.string().describe('The category of the part.'),
          compatibleVehicles: z.array(z.string()).describe('The vehicles that are compatible with the part.'),
        })
      ).describe('A list of compatible auto parts.'),
    }),
  },
  prompt: `You are an expert auto parts advisor. A user has the following vehicle: Make: {{{make}}}, Model: {{{model}}}.  Suggest compatible parts for this vehicle.  If you are unsure, use the searchAutoParts tool to find parts that are compatible with the vehicle. Return a list of parts that are compatible with the vehicle.
`,
});

const suggestCompatiblePartsFlow = ai.defineFlow<
  typeof SuggestCompatiblePartsInputSchema,
  typeof SuggestCompatiblePartsOutputSchema
>({
  name: 'suggestCompatiblePartsFlow',
  inputSchema: SuggestCompatiblePartsInputSchema,
  outputSchema: SuggestCompatiblePartsOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
