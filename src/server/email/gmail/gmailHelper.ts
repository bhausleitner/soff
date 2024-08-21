// tbd
import { get } from "lodash";
import Nylas, { type Message } from "nylas";
import { type TRPCContext } from "~/server/api/trpc";
import { getNonHashBaseUrl } from "~/server/email/outlook/outlookHelper";
import { htmlToText } from "html-to-text";
import { type ChatMessage } from "~/server/api/routers/chat";
import { type CreateAttachmentRequest } from "nylas";
import { getFileFromS3, uploadFileToS3 } from "~/server/s3/utils";
import { convertToHtml } from "~/utils/string-format";

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

  if (!googleGrantId) throw Error("Google Account not authorized");

  const data = await getInboxAsync(googleGrantId, conversationId);
  if (data.length === 0) return;

  const existingMessageIds = new Set(
    (
      await ctx.db.message.findMany({
        where: { gmailMessageId: { in: data.map((m) => m.id) } },
        select: { gmailMessageId: true }
      })
    ).map((m) => m.gmailMessageId)
  );

  const messagePromises = data
    .filter((m) => !existingMessageIds.has(m.id))
    .map(async (gmailMessage) => {
      const extractedContent =
        htmlToText(gmailMessage.body ?? "", { wordwrap: 130 }).split(
          /\n(?:On |Am )/
        )[0] ?? "";

      const newMessageObject = await ctx.db.message.create({
        data: {
          chatId,
          content: extractedContent,
          gmailMessageId: gmailMessage.id,
          conversationId,
          chatParticipantId: supplierChatParticipantId
        }
      });

      if (gmailMessage.attachments?.length) {
        const attachmentArray = await Promise.all(
          gmailMessage.attachments.map(async (attachment) => {
            const receivedAttachment = await nylas.attachments.download({
              identifier: googleGrantId,
              attachmentId: attachment.id,
              queryParams: { messageId: gmailMessage.id }
            });

            return {
              name: attachment.filename,
              contentBytes: await streamToBase64(receivedAttachment),
              contentType: attachment.contentType
            };
          })
        );

        await uploadFileToS3(
          attachmentArray,
          `emailAttachments/${gmailMessage.id}/`,
          newMessageObject
        );
      }
    });

  await Promise.all(messagePromises);
}

// Helper function to convert stream to base64
async function streamToBase64(stream: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
  });
}

export async function sendGmailAndCreateMessage(
  ctx: TRPCContext,
  inputChatMessage: ChatMessage,
  supplierEmail: string,
  supplierName: string
) {
  const googleGrantId = get(
    ctx.auth,
    "sessionClaims.publicMetadata.googleGrantId"
  );

  if (!googleGrantId) throw Error("Google Account not authorized");

  const [lastForeignMessage, attachments] = await Promise.all([
    ctx.db.message.findFirst({
      where: {
        chatId: inputChatMessage.chatId,
        chatParticipantId: inputChatMessage.chatParticipantId
      },
      orderBy: { createdAt: "desc" },
      select: { gmailMessageId: true, conversationId: true }
    }),
    constructAttachments(inputChatMessage.fileNames)
  ]);

  try {
    const htmlBody = `<div style="font-family: Arial, sans-serif; font-size: 14px;">
      ${convertToHtml(inputChatMessage.content)}
    </div>`;

    const { data: createdDraft } = await nylas.drafts.create({
      identifier: googleGrantId,
      requestBody: {
        to: [{ name: supplierName, email: supplierEmail }],
        subject: "Message from Soff API",
        body: htmlBody,
        replyToMessageId: lastForeignMessage?.gmailMessageId ?? undefined,
        attachments
      }
    });

    const { data: sentMessage } = await nylas.drafts.send({
      identifier: googleGrantId,
      draftId: createdDraft.id
    });

    await ctx.db.message.create({
      data: {
        chatId: inputChatMessage.chatId,
        gmailMessageId: sentMessage.id,
        content: inputChatMessage.content,
        chatParticipantId: inputChatMessage.chatParticipantId,
        conversationId: createdDraft.threadId!,
        fileNames: inputChatMessage.fileNames
      }
    });
  } catch (error) {
    throw new Error("Failed to send message");
  }
}

async function constructAttachments(
  fileNames: string[]
): Promise<CreateAttachmentRequest[]> {
  return Promise.all(
    fileNames.map(async (fileName) => {
      const file = await getFileFromS3(fileName);
      if (!(file.Body instanceof Buffer))
        throw new Error("File Body is not a buffer");

      const fileBase64 = file.Body.toString("base64");
      if (!fileBase64) throw new Error("File Body is not a base64 string");

      return {
        filename: fileName.split("/").pop() ?? "Unnamed File",
        content: fileBase64,
        contentType: file.ContentType!
      };
    })
  );
}
