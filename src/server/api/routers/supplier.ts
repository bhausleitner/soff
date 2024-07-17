import { z } from "zod";
import { Status, QuoteStatus } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { get } from "lodash";

export const supplierSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.nativeEnum(Status),
  email: z.string().email(),
  responseTime: z.number().nullable(),
  contactPerson: z.string().nullable()
});

const supplierArraySchema = z.array(supplierSchema);

const supplierIdSchema = z.object({ supplierId: z.number() });

const quoteSchema = z.object({
  id: z.number(),
  supplierId: z.number(),
  partId: z.number(),
  quantity: z.number(),
  price: z.number(),
  status: z.nativeEnum(QuoteStatus),
  createdAt: z.string(),
  updatedAt: z.string()
});

const quoteArraySchema = z.array(quoteSchema);

export type Supplier = z.infer<typeof supplierSchema>;
export type Quote = z.infer<typeof quoteSchema>;

export const supplierRouter = createTRPCRouter({
  getAllSuppliers: publicProcedure.query(async ({ ctx }) => {
    // fetch data from db
    const supplierData = await ctx.db.supplier.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        responseTime: true,
        contactPerson: true
      }
    });
    // validate data using schema
    supplierArraySchema.parse(supplierData);

    return supplierData;
  }),

  getSupplierById: publicProcedure
    .input(supplierIdSchema)
    .query(async ({ input, ctx }) => {
      // fetch supplier by id from db
      const supplierData = await ctx.db.supplier.findUnique({
        where: {
          id: input.supplierId
        }
      });

      return supplierData;
    }),

  getAllQuotes: publicProcedure.query(async ({ ctx }) => {
    const quoteData = await ctx.db.quote.findMany({});

    const formattedQuoteData = quoteData.map((quote) => ({
      ...quote,
      createdAt: quote.createdAt.toISOString(),
      updatedAt: quote.updatedAt.toISOString()
    }));

    quoteArraySchema.parse(formattedQuoteData);

    return quoteData;
  }),

  getQuotesBySupplierId: publicProcedure
    .input(supplierIdSchema)
    .query(async ({ input, ctx }) => {
      const quoteData = await ctx.db.quote.findMany({
        where: {
          supplierId: input.supplierId
        }
      });

      const formattedQuoteData = quoteData.map((quote) => ({
        ...quote,
        createdAt: quote.createdAt.toISOString(),
        updatedAt: quote.updatedAt.toISOString()
      }));

      quoteArraySchema.parse(formattedQuoteData);

      return formattedQuoteData;
    }),

  getAllOrders: publicProcedure.query(async ({ ctx }) => {
    const orderData = await ctx.db.order.findMany({});

    return orderData;
  }),

  getOrdersBySupplierId: publicProcedure
    .input(supplierIdSchema)
    .query(async ({ input, ctx }) => {
      const quotes = await ctx.db.quote.findMany({
        where: {
          supplierId: input.supplierId
        },
        select: {
          id: true
        }
      });

      const quoteIds = quotes.map((quote) => quote.id);

      const orders = await ctx.db.order.findMany({
        where: {
          quoteId: {
            in: quoteIds
          }
        }
      });

      return orders;
    })
});
