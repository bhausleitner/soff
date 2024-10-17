import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const productRouter = createTRPCRouter({
  getAllErpProducts: publicProcedure
    .input(
      z.object({
        clerkUserId: z.string()
      })
    )
    .query(async ({ input, ctx }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          clerkUserId: input.clerkUserId
        },
        select: {
          organizationId: true,
          organization: {
            select: {
              erpProducts: true
            }
          }
        }
      });

      return user?.organization?.erpProducts ?? [];
    })
});
