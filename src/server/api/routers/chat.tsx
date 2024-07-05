import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const messageSchema = z.object({ message: z.string() });

export const chatRouter = createTRPCRouter({
  sendChat: publicProcedure.input(messageSchema).mutation(async ({ input }) => {
    console.log(`Received message: ${input.message}`);
    await new Promise((resolve) => {
      setTimeout(resolve, 5000); // 5 seconds delay
    });
    return "OK";
  })
});
