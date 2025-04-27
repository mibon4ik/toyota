'use server';
/**
 * @fileOverview AI агент, предлагающий совместимые автозапчасти на основе марки и модели автомобиля.
 *
 * - suggestCompatibleParts - Функция, обрабатывающая предложение совместимых деталей.
 *   Она принимает марку и модель автомобиля в качестве входных данных и возвращает список совместимых автозапчастей.
 * - SuggestCompatiblePartsInput - Тип входных данных для функции suggestCompatibleParts.
 * - SuggestCompatiblePartsOutput - Тип возвращаемых данных для функции suggestCompatibleParts.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {AutoPart, searchAutoParts} from '@/services/autoparts';

const SuggestCompatiblePartsInputSchema = z.object({
  make: z.string().describe('Марка автомобиля.'),
  model: z.string().describe('Модель автомобиля.'),
});
export type SuggestCompatiblePartsInput = z.infer<typeof SuggestCompatiblePartsInputSchema>;

const SuggestCompatiblePartsOutputSchema = z.object({
  compatibleParts: z.array(
    z.object({
      id: z.string().describe('ID детали.'),
      name: z.string().describe('Название детали.'),
      brand: z.string().describe('Бренд детали.'),
      price: z.number().describe('Цена детали.'),
      imageUrl: z.string().describe('URL изображения детали.'),
      description: z.string().describe('Описание детали.'),
      category: z.string().describe('Категория детали.'),
      compatibleVehicles: z.array(z.string()).describe('Транспортные средства, совместимые с деталью.'),
    })
  ).describe('Список совместимых автозапчастей.'),
});
export type SuggestCompatiblePartsOutput = z.infer<typeof SuggestCompatiblePartsOutputSchema>;

export async function suggestCompatibleParts(input: SuggestCompatiblePartsInput): Promise<SuggestCompatiblePartsOutput> {
  return suggestCompatiblePartsFlow(input);
}

const partSearchTool = ai.defineTool({
  name: 'searchAutoParts',
  description: 'Поиск автозапчастей по запросу.',
  inputSchema: z.object({
    query: z.string().describe('Поисковый запрос для поиска автозапчастей.'),
  }),
  outputSchema: z.array(z.object({
    id: z.string().describe('ID детали.'),
    name: z.string().describe('Название детали.'),
    brand: z.string().describe('Бренд детали.'),
    price: z.number().describe('Цена детали.'),
    imageUrl: z.string().describe('URL изображения детали.'),
    description: z.string().describe('Описание детали.'),
    category: z.string().describe('Категория детали.'),
    compatibleVehicles: z.array(z.string()).describe('Транспортные средства, совместимые с деталью.'),
  })),
}, async (input) => {
  return await searchAutoParts(input.query);
});

const prompt = ai.definePrompt({
  name: 'suggestCompatiblePartsPrompt',
  tools: [partSearchTool],
  input: {
    schema: z.object({
      make: z.string().describe('Марка автомобиля.'),
      model: z.string().describe('Модель автомобиля.'),
    }),
  },
  output: {
    schema: z.object({
      compatibleParts: z.array(
        z.object({
          id: z.string().describe('ID детали.'),
          name: z.string().describe('Название детали.'),
          brand: z.string().describe('Бренд детали.'),
          price: z.number().describe('Цена детали.'),
          imageUrl: z.string().describe('URL изображения детали.'),
          description: z.string().describe('Описание детали.'),
          category: z.string().describe('Категория детали.'),
          compatibleVehicles: z.array(z.string()).describe('Транспортные средства, совместимые с деталью.'),
        })
      ).describe('Список совместимых автозапчастей.'),
    }),
  },
  prompt: `Вы - эксперт-консультант по автозапчастям. У пользователя есть следующий автомобиль: Марка: {{{make}}}, Модель: {{{model}}}. Предложите совместимые запчасти для этого автомобиля. Если вы не уверены, используйте инструмент searchAutoParts, чтобы найти детали, совместимые с автомобилем. Верните список деталей, совместимых с автомобилем.
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
