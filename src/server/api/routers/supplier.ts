import { z } from "zod";
import { Status } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// define schema
const getAllSuppliersSchema = z.array(z.object({
  title: z.string(),
  status: z.nativeEnum(Status),
  email: z.string().email(),
}))

// infer type from schema to keep frontend aligned
export type Supplier = z.infer<typeof getAllSuppliersSchema>

export const supplierRouter = createTRPCRouter({
  getAllSuppliers: publicProcedure
    .query(async ({ ctx }) => {

      // fetch data from db 
      const supplierData = await ctx.db.supplier.findMany({
        select: {
          title: true,
          email: true,
          status: true,
        }
      })
      // validate data using schema
      getAllSuppliersSchema.parse(supplierData)

      // return
      return supplierData;
    })
});
