import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const partSchema = z.object({
  id: z.number(),
  partNumber: z.string().nullable(),
  partName: z.string(),
  cadFile: z.string().nullable()
});

export const partArraySchema = z.array(partSchema);

// infer type from schema to keep frontend aligned
export type Part = z.infer<typeof partSchema>;

export const partRouter = createTRPCRouter({
  getPartsBySupplierId: publicProcedure
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
