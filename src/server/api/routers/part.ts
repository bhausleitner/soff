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
  partsBySupplier: publicProcedure.query(async ({ ctx }) => {
    // fetch data from db
    const partsData = await ctx.db.part.findMany({
      select: {
        id: true,
        partNumber: true,
        partName: true,
        price: true,
        cadFile: true
      }
    });

    // validate data using schema
    partArraySchema.parse(partsData);

    return partsData;
  })
});
