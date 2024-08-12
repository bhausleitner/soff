// tbd
import { get, map } from "lodash";
import Nylas, { type Message } from "nylas";
import { type TRPCContext } from "~/server/api/trpc";
import { getNonHashBaseUrl } from "~/server/email/outlook/outlookHelper";
import { htmlToText } from "html-to-text";
import { type ChatMessage } from "~/server/api/routers/chat";

export const GOOGLE_APP_REDIRECT_ROUTE = "/api/googleCallback";

export const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY ?? "",
  apiUri: process.env.NYLAS_API_URI ?? ""
});

export async function getAuthUrl(): Promise<string> {
  const authUrl = nylas.auth.urlForOAuth2({
    clientId: process.env.NYLAS_CLIENT_ID ?? "",
    provider: "google",
    redirectUri: `${getNonHashBaseUrl()}${GOOGLE_APP_REDIRECT_ROUTE}`
  });

  return authUrl;
}

export async function getInboxAsync(
  grantId: string,
  conversationId: string
): Promise<Message[]> {
  const { data } = await nylas.messages.list({
    identifier: grantId,
    queryParams: {
      threadId: conversationId
    }
  });

  return data;
}

export async function syncGmailMessages(
  ctx: TRPCContext,
  chatId: number,
  conversationId: string,
  supplierChatParticipantId: number
) {
  const googleGrantId = get(
    ctx.auth,
    "sessionClaims.publicMetadata.googleGrantId"
  );

  if (!googleGrantId) {
    throw Error("Google Account not authorized");
  }

  const data = await getInboxAsync(googleGrantId, conversationId);

  if (data.length > 0) {
    const messagePromises = map(data, async (gmailMessage: Message) => {
      // find existing message for message id
      const existingMessage = await ctx.db.message.findFirst({
        where: {
          gmailMessageId: gmailMessage.id
        }
      });

      // if message does not exist -> create new message object
      if (!existingMessage) {
        const extractedContent = htmlToText(gmailMessage.body ?? "", {
          wordwrap: 130
        });

        // create new message object
        await ctx.db.message.create({
          data: {
            chatId,
            gmailMessageId: gmailMessage.id,
            content: extractedContent.split("\nOn ")[0] ?? "",
            chatParticipantId: supplierChatParticipantId,
            conversationId: conversationId
          }
        });

        // if message has attachment -> upload it to s3
      }
    });

    await Promise.all(messagePromises);
  }
}

export async function sendGmailAndCreateMessage(
  ctx: TRPCContext,
  inputChatMessage: ChatMessage,
  supplierEmail: string
) {
  const googleGrantId = get(
    ctx.auth,
    "sessionClaims.publicMetadata.googleGrantId"
  );

  if (!googleGrantId) {
    throw Error("Google Account not authorized");
  }

  // get last messageId that is not from current user
  const lastForeignMessage = await ctx.db.message.findFirst({
    where: {
      chatId: inputChatMessage.chatId,
      chatParticipantId: inputChatMessage.chatParticipantId
    },
    orderBy: {
      createdAt: "desc"
    },
    select: {
      gmailMessageId: true,
      conversationId: true
    }
  });

  try {
    const { data: sentMessage } = await nylas.messages.send({
      identifier: googleGrantId,
      requestBody: {
        to: [{ name: "Name", email: supplierEmail }],
        subject: "Message from Soff API",
        body: inputChatMessage.content,
        replyToMessageId: lastForeignMessage?.gmailMessageId ?? undefined
      }
    });

    await ctx.db.message.create({
      data: {
        chatId: inputChatMessage.chatId,
        gmailMessageId: sentMessage.id,
        content: inputChatMessage.content,
        chatParticipantId: inputChatMessage.chatParticipantId,
        conversationId: sentMessage.threadId!
      }
    });
  } catch (error) {
    console.error(error);
  }
}
