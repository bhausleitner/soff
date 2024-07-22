import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { sendMailAsync } from "~/server/email/outlook/outlookHelper";
import { initMicrosoftAuthUrl } from "~/server/email/outlook/outlookHelper";
import _ from "lodash";

const messageSchema = z.object({
  message: z.string(),
  supplierId: z.number()
});

const createChatSchema = z.object({
  supplierId: z.number()
});

export const chatRouter = createTRPCRouter({
  requestMicrosoftAuthUrl: publicProcedure.mutation(async () => {
    const authUrl = await initMicrosoftAuthUrl();
    return authUrl;
  }),
  createChat: publicProcedure
    .input(createChatSchema)
    .mutation(async ({ input, ctx }) => {
      // make sure user is authenticated
      const clerkUserId = ctx.auth.userId;
      if (!clerkUserId) {
        throw new Error("User not authorized");
      }

      // get user
      const user = await ctx.db.user.findFirst({
        where: {
          clerkUserId: clerkUserId
        }
      });

      if (!user) {
        throw Error("User not found");
      }

      // create chat object & ChatParticipant objects
      const chatObject = await ctx.db.chat.create({
        data: {
          chatParticipants: {
            create: [
              {
                supplier: {
                  connect: {
                    id: input.supplierId
                  }
                }
              },
              {
                user: {
                  connect: {
                    id: user.id
                  }
                }
              }
            ]
          }
        }
      });

      return chatObject.id;
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

      // get supplier email
      const supplier = await ctx.db.supplier.findFirst({
        where: {
          id: input.supplierId
        },
        select: {
          email: true
        }
      });

      if (!supplier?.email) {
        throw Error("Supplier email not found");
      }

      // send mail
      await sendMailAsync(
        msHomeAccountId,
        input.message,
        input.message,
        supplier.email
      );

      return { success: true };
    })
});
