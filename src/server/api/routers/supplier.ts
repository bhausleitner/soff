import { z } from "zod";
import { Status, QuoteStatus, OrderStatus } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Define schemas
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

const orderSchema = z.object({
  id: z.number(),
  quoteId: z.number(),
  orderDate: z.string(),
  deliveryDate: z.string(),
  deliveryAddress: z.string(),
  status: z.nativeEnum(OrderStatus)
});

const orderArraySchema = z.array(orderSchema);

export type Supplier = z.infer<typeof supplierSchema>;
export type Quote = z.infer<typeof quoteSchema>;
export type Order = z.infer<typeof orderSchema>;

// Utility function to format date fields and validate data
const formatAndValidate = <T>(
  data: T[],
  schema: z.ZodSchema,
  dateFields: (keyof T)[]
) => {
  const formattedData = data.map((item) => {
    const formattedItem = { ...item };
    dateFields.forEach((field) => {
      if (formattedItem[field] instanceof Date) {
        formattedItem[field] = (
          formattedItem[field] as Date
        ).toISOString() as T[keyof T];
      }
    });
    return formattedItem;
  });

  schema.parse(formattedData);

  return formattedData;
};

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
    return formatAndValidate(quoteData, quoteArraySchema, [
      "createdAt",
      "updatedAt"
    ]);
  }),

  getQuotesBySupplierId: publicProcedure
    .input(supplierIdSchema)
    .query(async ({ input, ctx }) => {
      const quoteData = await ctx.db.quote.findMany({
        where: {
          supplierId: input.supplierId
        }
      });

      return formatAndValidate(quoteData, quoteArraySchema, [
        "createdAt",
        "updatedAt"
      ]);
    }),

  getAllOrders: publicProcedure.query(async ({ ctx }) => {
    const orderData = await ctx.db.order.findMany({});
    return formatAndValidate(orderData, orderArraySchema, [
      "orderDate",
      "deliveryDate"
    ]);
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

      return formatAndValidate(orderData, orderArraySchema, [
        "orderDate",
        "deliveryDate"
      ]);
    })
});
