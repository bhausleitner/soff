import { z } from "zod";
import { QuoteStatus } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { orderArraySchema } from "~/server/api/routers/supplier";

export const lineItemSchema = z.object({
  id: z.number(),
  partId: z.number(),
  description: z.string().nullable(),
  quantity: z.number(),
  price: z.number(),
  leadTime: z.string().nullable(),
  quoteId: z.number()
});
export const lineItemArraySchema = z.array(lineItemSchema);

export const quoteSchema = z.object({
  id: z.number(),
  supplierId: z.number(),
  paymentTerms: z.string().nullable(),
  price: z.number(),
  status: z.nativeEnum(QuoteStatus),
  createdAt: z.date(),
  updatedAt: z.date()
});
export const quoteArraySchema = z.array(quoteSchema);

const quoteIdSchema = z.object({
  quoteId: z.number()
});

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
    })
});
