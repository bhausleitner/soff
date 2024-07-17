import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const partSchema = z.object({
  id: z.number(),
  partNumber: z.string().nullable(),
  partName: z.string(),
  price: z.number().nullable(),
  cadFile: z.string().nullable()
});

export const partArraySchema = z.array(partSchema);

// infer type from schema to keep frontend aligned
export type Part = z.infer<typeof partSchema>;

export const partRouter = createTRPCRouter({
  getAllParts: publicProcedure.query(async ({ ctx }) => {
    const partsData = await ctx.db.part.findMany({
      select: {
        id: true,
        partNumber: true,
        partName: true,
        price: true,
        cadFile: true
      }
    });

    partArraySchema.parse(partsData);

    return partsData;
  }),

  partsBySupplier: publicProcedure
    .input(z.object({ supplierId: z.number() }))
    .query(async ({ ctx, input }) => {
      const partsData = await ctx.db.part.findMany({
        where: {
          suppliers: {
            some: {
              supplierId: input.supplierId
            }
          }
        }
      });

      partArraySchema.parse(partsData);

      return partsData;
    })
});
