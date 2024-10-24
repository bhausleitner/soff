import { z } from "zod";
import { Status, OrderStatus } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import * as odooUtils from "~/server/odoo/utils";
import { emailToName } from "~/utils/string-format";

const supplierLineItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.nativeEnum(Status),
  email: z.string().email().nullable(),
  phone: z.string().nullable().optional(),
  responseTime: z.number().nullable(),
  contactPerson: z.string().nullable().optional(),
  utcOffset: z.number().nullable(),
  country: z.string().nullable()
});

export const contactLineItemSchema = z.object({
  function: z.string().nullable(),
  id: z.number(),
  email: z.string().nullable(),
  status: z.nativeEnum(Status),
  contactPerson: z.string().nullable(),
  organization: z
    .object({
      erpContactUrl: z.string().nullable()
    })
    .nullable(),
  erpId: z.number().nullable()
});

export type SupplierLineItem = z.infer<typeof supplierLineItemSchema>;
export type ContactLineItem = z.infer<typeof contactLineItemSchema>;

export const supplierSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.nativeEnum(Status),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  responseTime: z.number().nullable(),
  contactPerson: z.string().nullable(),
  utcOffset: z.number().nullable()
});

const orderSchema = z.object({
  id: z.number(),
  quoteId: z.number(),
  orderDate: z.date(),
  deliveryDate: z.date(),
  deliveryAddress: z.string(),
  status: z.nativeEnum(OrderStatus)
});

export const orderArraySchema = z.array(orderSchema);

export type Order = z.infer<typeof orderSchema>;

export const supplierRouter = createTRPCRouter({
  getSupplierContacts: publicProcedure
    .input(z.object({ supplierId: z.number() }))
    .query(async ({ input, ctx }) => {
      const contacts = await ctx.db.supplier.findMany({
        where: {
          supplierParentId: input.supplierId
        },
        select: {
          id: true,
          email: true,
          status: true,
          contactPerson: true,
          erpId: true,
          function: true,
          organization: {
            select: {
              erpContactUrl: true
            }
          }
        }
      });

      return contacts;
    }),
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
                where: {
                  supplierParentId: null
                },
                select: {
                  id: true,
                  name: true,
                  email: true,
                  status: true,
                  responseTime: true,
                  contactPerson: true,
                  utcOffset: true,
                  country: true
                }
              }
            }
          }
        }
      });

      const supplierData = suppliers?.organization?.suppliers ?? [];

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
        supplierName: z.string().optional(),
        contactName: z.string().optional(),
        contactRole: z.string().optional(),
        email: z.string().email(),
        status: z.nativeEnum(Status).optional()
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
      let autoName = "";
      if (!input.supplierName) {
        autoName = emailToName(input.email);
      }

      const newSupplier = await ctx.db.supplier.create({
        data: {
          name: input.supplierName ?? autoName,
          contactPerson: input.contactName,
          email: input.email,
          status: input.status,
          organization: { connect: { id: user.organizationId } }
        }
      });

      return {
        id: newSupplier.id,
        name: newSupplier.name,
        email: newSupplier.email
      };
    }),

  syncSuppliers: publicProcedure.mutation(async ({ ctx }) => {
    const queryData = await ctx.db.user.findFirst({
      where: { clerkUserId: ctx.auth.userId! },
      select: {
        organization: {
          select: {
            id: true,
            name: true,
            erpUrl: true,
            erp: true
          }
        }
      }
    });

    if (queryData?.organization?.erp !== "ODOO") {
      throw new Error("Syncing only available for ODOO");
    }

    if (!queryData.organization.erpUrl || !queryData.organization.id) {
      throw new Error("Organization not found");
    }

    const orgName = queryData.organization.name.toLowerCase();
    const orgId = queryData.organization.id;
    const erpUrl = queryData.organization.erpUrl;

    const odooUid = await odooUtils.authenticate(erpUrl, orgName);

    if (!odooUid) {
      throw new Error("Odoo authentication failed");
    }

    void odooUtils.syncSuppliers(erpUrl, odooUid, orgName, orgId);
  })
});
