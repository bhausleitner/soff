import { type Quote } from "@prisma/client";
import openai from "~/server/openai/config";

export interface QuoteComparison {
  lineItemDescription: string;
  quotes: { quoteId: number; price: number; quantity: number }[];
}

const PROMPT_OUTPUT_FORMAT: QuoteComparison[] = [
  {
    lineItemDescription: "this is the first reconciled lineitem",
    quotes: [
      { quoteId: 3, price: 21450, quantity: 1 },
      { quoteId: 4, price: 24000, quantity: 1 },
      { quoteId: 5, price: 21450, quantity: 1 }
    ]
  }
];

export async function reconcileAndCompareQuotes(
  quotes: Pick<Quote, "id">[]
): Promise<QuoteComparison[]> {
  const inputPrompt = `I want to compare these quotes. Reconcile the line-items. The output format should be: ${JSON.stringify(PROMPT_OUTPUT_FORMAT)}`;
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: inputPrompt
          },
          {
            type: "text",
            text: `${JSON.stringify(quotes)}`
          }
        ]
      }
    ]
  });

  const responseString = response.choices[0]?.message.content;
  const jsonRegex = /```json\n([\s\S]*?)\n```/;
  const match = responseString?.match(jsonRegex);

  if (!match?.[1]) {
    throw new Error("No JSON data found", { cause: responseString });
  }

  const parsedData = JSON.parse(match[1]) as QuoteComparison[];

  return parsedData;
}
