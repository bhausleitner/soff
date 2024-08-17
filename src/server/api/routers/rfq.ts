import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const rfqRouter = createTRPCRouter({
  getAllRequestsForQuotes: publicProcedure
    .input(z.object({ clerkUserId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { clerkUserId: input.clerkUserId }
      });
      if (!user) {
        throw new Error("User not found");
      }

      if (!user.organizationId) {
        throw new Error("User does not belong to an organization");
      }

      const rfqs = await ctx.db.requestForQuote.findMany({
        where: { organizationId: user.organizationId }
      });
      return rfqs;
    }),
  createRequestForQuote: publicProcedure
    .input(
      z.object({
        messageBody: z.string(),
        supplierIds: z.array(z.number())
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

      // create request for quote object
      const newRfqObject = await ctx.db.requestForQuote.create({
        data: {
          organization: {
            connect: { id: user.organizationId }
          },
          suppliers: {
            connect: input.supplierIds.map((id) => ({ id }))
          }
        },
        include: {
          suppliers: true,
          organization: true
        }
      });

      // iterate through supplierIds and create chat objects and chat participants
      // input.supplierIds.map(async (supplierId) => {
      //   // create chat object
      //   const chatObject = await ctx.db.chat.create({
      //     data: {}
      //   });

      //   // create supplier chat participant
      //   await ctx.db.chatParticipant.create({
      //     data: {
      //       chatId: chatObject.id,
      //       supplierId: input.supplierId
      //     }
      //   });

      //   // create user chat participant
      //   await ctx.db.chatParticipant.create({
      //     data: {
      //       chatId: chatObject.id,
      //       userId: user.id
      //     }
      //   });
      // });
    })
});
