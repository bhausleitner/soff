import { z } from "zod";
import { Status, QuoteStatus, OrderStatus } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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

export const quoteSchema = z.object({
  id: z.number(),
  supplierId: z.number(),
  partId: z.number(),
  quantity: z.number(),
  price: z.number(),
  status: z.nativeEnum(QuoteStatus),
  createdAt: z.date(),
  updatedAt: z.date()
});

const quoteArraySchema = z.array(quoteSchema);

const orderSchema = z.object({
  id: z.number(),
  quoteId: z.number(),
  orderDate: z.date(),
  deliveryDate: z.date(),
  deliveryAddress: z.string(),
  status: z.nativeEnum(OrderStatus)
});

const orderArraySchema = z.array(orderSchema);

export type Supplier = z.infer<typeof supplierSchema>;
export type Quote = z.infer<typeof quoteSchema>;
export type Order = z.infer<typeof orderSchema>;

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
      const supplierData = await ctx.db.supplier.findUnique({
        where: {
          id: input.supplierId
        }
      });

      return supplierData;
    }),

  getAllQuotes: publicProcedure.query(async ({ ctx }) => {
    const quoteData = await ctx.db.quote.findMany({});

    quoteArraySchema.parse(quoteData);

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

      quoteArraySchema.parse(quoteData);

      return quoteData;
    }),

  getOrdersBySupplierId: publicProcedure
    .input(supplierIdSchema)
    .query(async ({ input, ctx }) => {
      const orderData = await ctx.db.order.findMany({
        where: {
          quote: {
            supplierId: input.supplierId
          }
        }
      });

      orderArraySchema.parse(orderData);

      return orderData;
    })
});
