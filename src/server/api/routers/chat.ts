import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  getInboxAsync,
  getMessageAttachments,
  replyEmailAsync,
  sendInitialEmail
} from "~/server/email/outlook/outlookHelper";
import { uploadFileToS3 } from "~/server/s3/utils";
import { initMicrosoftAuthUrl } from "~/server/email/outlook/outlookHelper";
import { get, map } from "lodash";
import { type Message } from "@microsoft/microsoft-graph-types";

const createChatSchema = z.object({
  supplierId: z.number()
});

const chatMessageSchema = z.object({
  id: z.number(),
  chatId: z.number(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  fileNames: z.array(z.string()),
  outlookMessageId: z.string().nullable().optional(),
  conversationId: z.string().nullable().optional(),
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

      // get supplier chat participant object
      const supplierChatParticipant = chat?.chatParticipants.find(
        (participant) => participant.supplier !== null
      );

      // get conversationId from first message

      const conversationId = chat?.messages?.[0]?.conversationId;

      if (conversationId) {
        const msHomeAccountId = get(
          ctx.auth,
          "sessionClaims.publicMetadata.microsoftHomeAccountId"
        );

        if (!msHomeAccountId) {
          throw Error("Microsoft Account not authorized");
        }

        const inbox = await getInboxAsync(msHomeAccountId, conversationId);

        // iterate through inbox and check if chatmessage object has been already created
        if (inbox?.value) {
          // Use map to create an array of promises
          const messagePromises = map(
            inbox.value,
            async (outlookMessage: Message) => {
              const existingMessage = await ctx.db.message.findFirst({
                where: {
                  outlookMessageId: outlookMessage.id
                }
              });

              // Create message object if no existing message AND new message has a bodyPreview
              if (
                !existingMessage &&
                outlookMessage.bodyPreview &&
                supplierChatParticipant
              ) {
                const newMessageObject = await ctx.db.message.create({
                  data: {
                    chatId: input.chatId,
                    content: outlookMessage.bodyPreview,
                    outlookMessageId: outlookMessage.id,
                    conversationId: conversationId,
                    chatParticipantId: supplierChatParticipant.id
                  }
                });

                if (outlookMessage.hasAttachments) {
                  const attachments = await getMessageAttachments(
                    msHomeAccountId,
                    outlookMessage.id!
                  );

                  await uploadFileToS3(
                    attachments,
                    `emailAttachments/${outlookMessage.id}/`,
                    newMessageObject
                  );
                }
              }
            }
          );

          // Wait for all promises to resolve
          await Promise.all(messagePromises);
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
          messages: true
        }
      });

      return { newChat };
    }),
  sendEmail: publicProcedure
    .input(chatMessageSchema)
    .mutation(async ({ input, ctx }) => {
      if (input.content === "fail") {
        throw Error;
      }

      // use lodash to get the msHomeAccountid
      const msHomeAccountId = get(
        ctx.auth,
        "sessionClaims.publicMetadata.microsoftHomeAccountId"
      );

      if (!msHomeAccountId) {
        throw Error("Microsoft Account not authorized");
      }

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

      // get messageId from last supplier message
      const lastMessage = await ctx.db.message.findFirst({
        where: {
          chatId: input.chatId,
          chatParticipantId: chatParticipant.id
        },
        orderBy: {
          createdAt: "desc"
        },
        select: {
          outlookMessageId: true,
          conversationId: true
        }
      });

      const lastMessageId = lastMessage?.outlookMessageId;

      try {
        if (lastMessageId) {
          // existing thread
          await replyEmailAsync(
            msHomeAccountId,
            input.content,
            chatParticipant.supplier.email,
            lastMessageId
          );

          // Create a new message object in the database
          await ctx.db.message.create({
            data: {
              chatId: input.chatId,
              content: input.content,
              chatParticipantId: input.chatParticipantId,
              conversationId: lastMessage.conversationId
            }
          });
        } else {
          // new thread
          const { newMessageId, conversationId } = await sendInitialEmail(
            msHomeAccountId,
            "Message from Soff Chat",
            input.content,
            chatParticipant.supplier.email
          );
          // Create a new message object in the database
          await ctx.db.message.create({
            data: {
              chatId: input.chatId,
              content: input.content,
              chatParticipantId: input.chatParticipantId,
              outlookMessageId: newMessageId,
              conversationId: conversationId
            }
          });
        }
      } catch (error) {
        throw new Error(`Failed to process request: ${String(error)}`);
      }

      return { success: true };
    })
});
