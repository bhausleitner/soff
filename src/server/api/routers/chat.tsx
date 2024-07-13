import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { sendMailAsync } from "~/server/email/outlook/outlookHelper";
import { initMicrosoftAuthUrl } from "~/server/email/outlook/outlookHelper";

const messageSchema = z.object({ message: z.string() });

export const chatRouter = createTRPCRouter({
  requestMicrosoftAuthUrl: publicProcedure.mutation(async () => {
    const authUrl = await initMicrosoftAuthUrl();
    return authUrl;
  }),
  sendChat: publicProcedure.input(messageSchema).mutation(async ({ input }) => {
    if (input.message === "fail") {
      throw Error;
    }

    // send Email
    await sendMailAsync(
      "Hello from Soff Chat!",
      input.message,
      "berni@soff.ai"
    );

    return { success: true };
  })
});
