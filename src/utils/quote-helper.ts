import { type Quote } from "@prisma/client";
import openai from "~/server/openai/config";

export interface QuoteComparison {
  rfqLineItemDescription: string;
  quotes: {
    quoteId: number;
    price: number;
    quantity: number;
    originalDescription: string;
  }[];
}

export interface QuotesInput {
  id: number;
  lineItems: {
    rfqLineItemDescription: string;
    price: number;
    quantity: number;
    description: string;
  }[];
}

const PROMPT_OUTPUT_FORMAT: QuoteComparison[] = [
  {
    rfqLineItemDescription: "this is the first reconciled lineitem",
    quotes: [
      {
        quoteId: 3,
        price: 21450,
        quantity: 1,
        originalDescription: "original description from this quote"
      },
      {
        quoteId: 4,
        price: 24000,
        quantity: 1,
        originalDescription: "original description from this quote"
      },
      {
        quoteId: 5,
        price: 21450,
        quantity: 1,
        originalDescription: "original description from this quote"
      }
    ]
  }
];

export function compareQuotes(
  processedQuotes: QuotesInput[]
): QuoteComparison[] {
  const outputMap = new Map<string, QuoteComparison>();

  processedQuotes.forEach((quote) => {
    quote.lineItems.forEach((item) => {
      if (item.rfqLineItemDescription) {
        const outputQuote = {
          quoteId: quote.id,
          price: item.price,
          quantity: item.quantity,
          originalDescription: item?.description
        };

        if (outputMap.has(item.rfqLineItemDescription)) {
          outputMap.get(item.rfqLineItemDescription)!.quotes.push(outputQuote);
        } else {
          outputMap.set(item.rfqLineItemDescription, {
            rfqLineItemDescription: item.rfqLineItemDescription,
            quotes: [outputQuote]
          });
        }
      }
    });
  });

  return Array.from(outputMap.values());
}

export async function reconcileAndCompareQuotesAI(
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
