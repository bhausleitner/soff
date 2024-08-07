import { z } from "zod";
import { Status, OrderStatus } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { quoteArraySchema } from "~/server/api/routers/quote";

export const supplierSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.nativeEnum(Status),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  responseTime: z.number().nullable(),
  contactPerson: z.string().nullable()
});

const supplierArraySchema = z.array(supplierSchema);

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
  getAllSuppliers: publicProcedure
    .input(
      z.object({
        clerkUserId: z.string()
      })
    )
    .query(async ({ input, ctx }) => {
      const suppliers = await ctx.db.user.findFirst({
        where: {
          clerkUserId: input.clerkUserId
        },
        select: {
          organizationId: true,
          organization: {
            select: {
              suppliers: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  status: true,
                  responseTime: true,
                  contactPerson: true
                }
              }
            }
          }
        }
      });

      const supplierData = suppliers?.organization?.suppliers ?? [];

      supplierArraySchema.parse(supplierData);

      return supplierData;
    }),

  getSupplierById: publicProcedure
    .input(z.object({ supplierId: z.number() }))
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
    .input(z.object({ supplierId: z.number() }))
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
    .input(z.object({ supplierId: z.number() }))
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
    }),

  createSupplier: publicProcedure
    .input(
      z.object({
        companyName: z.string(),
        contactName: z.string(),
        contactRole: z.string(),
        email: z.string().email(),
        status: z.nativeEnum(Status)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { clerkUserId: ctx.auth.userId! },
        select: { organizationId: true }
      });

      if (!user?.organizationId) {
        throw new Error("User or organization not found");
      }

      await ctx.db.supplier.create({
        data: {
          name: input.companyName,
          contactPerson: input.contactName,
          email: input.email,
          status: input.status,
          organization: { connect: { id: user.organizationId } }
        }
      });
    })
});
