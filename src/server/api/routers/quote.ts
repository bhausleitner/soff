import { z } from "zod";
import { QuoteStatus } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { orderArraySchema } from "~/server/api/routers/supplier";
import openai from "~/server/openai/config";
import { getFileFromS3 } from "~/server/s3/utils";
import { convertPdfToImage } from "~/server/openai/utils";

export const quoteSchema = z.object({
  id: z.number(),
  supplierId: z.number(),
  price: z.number(),
  status: z.nativeEnum(QuoteStatus),
  createdAt: z.date(),
  updatedAt: z.date()
});
export const quoteArraySchema = z.array(quoteSchema);
const quoteIdSchema = z.object({
  quoteId: z.number()
});

interface ParsedQuoteData {
  totalPrice: number;
  lineItems: {
    partId: number | null;
    quantity: number;
    price: number;
    description: string;
  }[];
}

export type Quote = z.infer<typeof quoteSchema>;

export const quoteRouter = createTRPCRouter({
  getAllQuotes: publicProcedure.query(async ({ ctx }) => {
    const quoteData = await ctx.db.quote.findMany({});

    quoteArraySchema.parse(quoteData);

    return quoteData;
  }),

  getQuoteById: publicProcedure
    .input(quoteIdSchema)
    .query(async ({ ctx, input }) => {
      const quote = await ctx.db.quote.findUnique({
        where: { id: input.quoteId }
      });

      quoteSchema.parse(quote);

      return quote;
    }),

  getOrdersByQuoteId: publicProcedure
    .input(quoteIdSchema)
    .query(async ({ ctx, input }) => {
      const orderData = await ctx.db.order.findMany({
        where: { quoteId: input.quoteId }
      });

      orderArraySchema.parse(orderData);

      return orderData;
    }),
  createQuoteFromPdf: publicProcedure
    .input(
      z.object({
        fileKey: z.string(),
        supplierId: z.number()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const pdfData = await getFileFromS3(input.fileKey);

      if (!pdfData.Body) {
        throw new Error("No PDF data found");
      }

      const pngPages = await convertPdfToImage(pdfData.Body as ArrayBuffer);

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: 'Given the following quote data, parse it into the specified JSON format: {"totalPrice": 1000, "lineItems": [{"partId": 1, "quantity": 10, "price": 100, "description": "Part 1 Description"}, {"partId": 2, "quantity": 5, "price": 200, "description": "Part 2 Description"}]}'
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${pngPages.toString("base64")}`
                }
              }
            ]
          }
        ]
      });

      const responseString = response.choices[0]?.message.content;

      const jsonRegex = /```json\n([\s\S]*?)\n```/;
      const match = responseString?.match(jsonRegex);

      if (!match?.[1]) {
        throw new Error("No JSON data found");
      }

      const parsedData = JSON.parse(match[1]) as ParsedQuoteData;

      // create quote object
      const quote = await ctx.db.quote.create({
        data: {
          supplierId: input.supplierId,
          price: parsedData.totalPrice,
          status: QuoteStatus.RECEIVED
        }
      });

      // iterate through line item object
      for (const lineItem of parsedData.lineItems) {
        await ctx.db.lineItem.create({
          data: {
            quoteId: quote.id,
            description: lineItem.description,
            quantity: lineItem.quantity,
            price: lineItem.price
          }
        });
      }

      return quote.id.toString();
      // return "2";
    })
});
