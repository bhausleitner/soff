import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { sendMailAsync } from "~/server/email/outlook/outlookHelper";
import { initMicrosoftAuthUrl } from "~/server/email/outlook/outlookHelper";
import _ from "lodash";

const messageSchema = z.object({ message: z.string() });

export const chatRouter = createTRPCRouter({
  requestMicrosoftAuthUrl: publicProcedure.mutation(async () => {
    const authUrl = await initMicrosoftAuthUrl();
    return authUrl;
  }),
  sendChat: publicProcedure
    .input(messageSchema)
    .mutation(async ({ input, ctx }) => {
      if (input.message === "fail") {
        throw Error;
      }

      // use lodash get to get the msHomeAccountid
      const msHomeAccountId = _.get(
        ctx.auth,
        "sessionClaims.publicMetadata.microsoftHomeAccountId"
      );

      if (!msHomeAccountId) {
        throw Error("Microsoft Account not authorized");
      }

      // send mail
      await sendMailAsync(
        msHomeAccountId,
        input.message,
        input.message,
        "berni@soff.ai"
      );
      return { success: true };
    })
});
