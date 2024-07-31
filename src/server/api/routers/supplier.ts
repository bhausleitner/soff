import { z } from "zod";
import { Status, OrderStatus } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { quoteArraySchema } from "~/server/api/routers/quote";

export const supplierSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.nativeEnum(Status),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  responseTime: z.number().nullable(),
  contactPerson: z.string().nullable()
});

const supplierArraySchema = z.array(supplierSchema);
const supplierIdSchema = z.object({ supplierId: z.number() });

const orderSchema = z.object({
  id: z.number(),
  quoteId: z.number(),
  orderDate: z.date(),
  deliveryDate: z.date(),
  deliveryAddress: z.string(),
  status: z.nativeEnum(OrderStatus)
});

export const orderArraySchema = z.array(orderSchema);

export type Supplier = z.infer<typeof supplierSchema>;
export type Order = z.infer<typeof orderSchema>;

export const supplierRouter = createTRPCRouter({
  getAllSuppliers: publicProcedure.query(async ({ ctx }) => {
    const supplierData = await ctx.db.supplier.findMany({});

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

      supplierSchema.parse(supplierData);

      return supplierData;
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
