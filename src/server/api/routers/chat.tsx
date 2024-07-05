import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";

const messageSchema = z.object({ message: z.string() });

export const chatRouter = createTRPCRouter({
  sendChat: publicProcedure
    .input(messageSchema)
    .mutation(async ({ input }) => {
      
      try {
        await new Promise((resolve) => {
          setTimeout(resolve, 5000); // 5 seconds delay
        });
        return "OK"

      } catch (error) {
        throw new Error(`Failed to send chat: ${error}`);
      }
    })
});
