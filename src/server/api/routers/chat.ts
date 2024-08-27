import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  sendOutlookAndCreateMessage,
  syncOutlookMessages
} from "~/server/email/outlook/outlookHelper";
import { initMicrosoftAuthUrl } from "~/server/email/outlook/outlookHelper";
import { EmailProvider } from "@prisma/client";

import {
  getAuthUrl,
  sendGmailAndCreateMessage,
  syncGmailMessages
} from "~/server/email/gmail/gmailHelper";

const createChatSchema = z.object({
  supplierId: z.number()
});

const chatMessageSchema = z.object({
  id: z.number(),
  chatId: z.number(),
  subject: z.string().optional(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  fileNames: z.array(z.string()),
  outlookMessageId: z.string().nullable().optional(),
  gmailMessageId: z.string().nullable().optional(),
  conversationId: z.string().nullable().optional(),
  chatParticipantId: z.number(),
  ccRecipients: z
    .array(
      z.object({
        email: z.string()
      })
    )
    .optional()
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatRouter = createTRPCRouter({
  requestMicrosoftAuthUrl: publicProcedure.mutation(async () => {
    const authUrl = await initMicrosoftAuthUrl();
    return authUrl;
  }),
  requestGoogleAuthUrl: publicProcedure.mutation(async () => {
    const authUrl = await getAuthUrl();
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
              user: {
                select: {
                  id: true,
                  email: true,
                  organization: {
                    select: {
                      emailProvider: true
                    }
                  }
                }
              }
            }
          },
          messages: true
        }
      });

      // get supplier chat participant object
      const supplierChatParticipant = chat?.chatParticipants.find(
        (participant) => participant.supplier !== null
      );

      // get the users email provider
      const emailProvider = chat?.chatParticipants.find((p) => p.user)?.user
        ?.organization?.emailProvider;

      // get conversationId from first message
      const conversationId = chat?.messages?.[0]?.conversationId;

      if (conversationId && supplierChatParticipant?.id) {
        switch (emailProvider) {
          case EmailProvider.OUTLOOK:
            await syncOutlookMessages(
              ctx,
              input.chatId,
              conversationId,
              supplierChatParticipant.id
            );
            break;
          case EmailProvider.GMAIL:
            await syncGmailMessages(
              ctx,
              input.chatId,
              conversationId,
              supplierChatParticipant.id
            );
            break;
        }
      }

      const newChat = await ctx.db.chat.findFirst({
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
          messages: true,
          quotes: {
            where: {
              isActive: true
            },
            select: {
              id: true
            }
          }
        }
      });

      return { newChat, emailProvider };
    }),
  sendEmail: publicProcedure
    .input(
      z.object({
        chatMessage: chatMessageSchema,
        emailProvider: z.nativeEnum(EmailProvider)
      })
    )
    .mutation(async ({ input, ctx }) => {
      // for UI failure testing
      if (input.chatMessage.content === "fail") {
        throw Error;
      }

      // get supplier email from chat object
      const chatParticipant = await ctx.db.chatParticipant.findFirst({
        where: {
          chatId: input.chatMessage.chatId,
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

      try {
        switch (input.emailProvider) {
          case EmailProvider.OUTLOOK:
            await sendOutlookAndCreateMessage(
              ctx,
              input.chatMessage,
              chatParticipant.supplier.email
            );
            break;
          case EmailProvider.GMAIL:
            await sendGmailAndCreateMessage(
              ctx,
              input.chatMessage,
              chatParticipant.supplier.email,
              chatParticipant.supplier.contactPerson
            );
            break;
        }
      } catch (error) {
        throw new Error(`Failed to process request: ${String(error)}`);
      }

      return { success: true };
    })
});
