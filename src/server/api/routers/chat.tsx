import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { sendMailAsync } from "~/server/email/outlook/outlookHelper";

const messageSchema = z.object({ message: z.string() });

export const chatRouter = createTRPCRouter({
  sendChat: publicProcedure.input(messageSchema).mutation(async ({ input }) => {
    console.log(`Received message: ${input.message}`);
    // await new Promise((resolve) => {
    //   setTimeout(resolve, 1000); // 1 seconds delay
    // });

    if (input.message === "fail") {
      throw Error;
    }

    // send Email
    await sendMailAsync({
      subject: "Hello from Soff!",
      body: input.message,
      recipientEmail: "berni@soff.ai"
    });

    return { success: true };
  })
});
