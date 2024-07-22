import { z } from "zod";
import { Status } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// define schema
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

// infer type from schema to keep frontend aligned
export type Supplier = z.infer<typeof supplierSchema>;

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
    })
});
