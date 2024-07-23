import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { sendMailAsync } from "~/server/email/outlook/outlookHelper";
import { initMicrosoftAuthUrl } from "~/server/email/outlook/outlookHelper";
import _ from "lodash";

const createChatSchema = z.object({
  supplierId: z.number()
});

const chatMessageSchema = z.object({
  id: z.number(),
  chatId: z.number(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  chatParticipantId: z.number()
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

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

      // create chat object
      const chatObject = await ctx.db.chat.create({
        data: {}
      });

      // create supplier chat participant
      await ctx.db.chatParticipant.create({
        data: {
          chatId: chatObject.id,
          supplierId: input.supplierId
        }
      });

      // create user chat participant
      await ctx.db.chatParticipant.create({
        data: {
          chatId: chatObject.id,
          userId: user.id
        }
      });

      return chatObject.id;
    }),
  getChat: publicProcedure
    .input(
      z.object({
        chatId: z.number()
      })
    )
    .query(async ({ input, ctx }) => {
      const chat = await ctx.db.chat.findFirst({
        where: {
          id: input.chatId
        },
        select: {
          chatParticipants: {
            select: {
              id: true,
              supplier: true,
              user: true
            }
          },
          messages: true
        }
      });
      return chat;
    }),
  sendChat: publicProcedure
    .input(chatMessageSchema)
    .mutation(async ({ input, ctx }) => {
      if (input.content === "fail") {
        throw Error;
      }

      // use lodash to get the msHomeAccountid
      const msHomeAccountId = _.get(
        ctx.auth,
        "sessionClaims.publicMetadata.microsoftHomeAccountId"
      );

      if (!msHomeAccountId) {
        throw Error("Microsoft Account not authorized");
      }

      // create new message object
      await ctx.db.message.create({
        data: {
          chatId: input.chatId,
          content: input.content,
          chatParticipantId: input.chatParticipantId
        }
      });

      // get supplier email from chat object
      const chatParticipant = await ctx.db.chatParticipant.findFirst({
        where: {
          chatId: input.chatId,
          supplierId: {
            not: null
          }
        },
        include: {
          supplier: true
        }
      });

      if (!chatParticipant?.supplier?.email) {
        throw Error("Supplier email not found");
      }

      // send mail
      await sendMailAsync(
        msHomeAccountId,
        "Message from Soff Chat",
        input.content,
        chatParticipant.supplier.email
      );

      return { success: true };
    })
});
