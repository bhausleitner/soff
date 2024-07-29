import { Client, type PageCollection } from "@microsoft/microsoft-graph-client";
import { type Message } from "@microsoft/microsoft-graph-types";
import {
  type AuthorizationUrlRequest,
  type AuthorizationCodeRequest
} from "@azure/msal-node";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { msalClient } from "~/server/email/outlook/initMsalClient";
import { getFileFromS3 } from "~/server/s3/utils";

export interface Attachment {
  id?: string;
  name: string;
  contentBytes: string;
  contentType?: string;
  "@odata.type"?: string;
}

interface AttachmentsResponse {
  value: Attachment[];
}

const MICROSOFT_APP_REDIRECT_ROUTE = "/api/graphMicrosoftCallback";

const MICROSOFT_APP_SCOPES = [
  "user.read",
  "mailboxsettings.read",
  "mail.read",
  "mail.send",
  "mail.readWrite"
];

const getNonHashBaseUrl = () =>
  process.env.VERCEL_URL ? "https://app.soff.ai" : "http://localhost:3000";

export async function initMicrosoftAuthUrl(): Promise<string> {
  const urlParameters: AuthorizationUrlRequest = {
    scopes: MICROSOFT_APP_SCOPES,
    redirectUri: `${getNonHashBaseUrl()}${MICROSOFT_APP_REDIRECT_ROUTE}`
  };

  return await msalClient.getAuthCodeUrl(urlParameters);
}

export async function initMsGraphClient(queryCode: string, userId: string) {
  // get accessToken from msalClient
  const tokenRequest: AuthorizationCodeRequest = {
    code: queryCode,
    scopes: MICROSOFT_APP_SCOPES,
    redirectUri: `${getNonHashBaseUrl()}${MICROSOFT_APP_REDIRECT_ROUTE}`
  };

  // request token from MSAL Client
  const response = await msalClient.acquireTokenByCode(tokenRequest);

  // store microsoftAccessToken in Clerk session claims
  await clerkClient?.users.updateUserMetadata(userId, {
    publicMetadata: {
      microsoftHomeAccountId: response?.account?.homeAccountId
    }
  });
}

export async function getMsGraphClient(
  msHomeAccountId: string
): Promise<Client> {
  // get account from Microsoft Authentication Library Cache
  /* eslint-disable-next-line @typescript-eslint/await-thenable */
  const tokenCache = await msalClient.getTokenCache();

  // Check if tokenCache is defined
  if (!tokenCache) {
    throw new Error(
      `Token Cache from Account with home ID ${msHomeAccountId} not found`
    );
  }

  const account = await tokenCache.getAccountByHomeId(msHomeAccountId);

  // Check if account is defined
  if (!account) {
    throw new Error(`Account with home ID ${msHomeAccountId} not found`);
  }

  // acquire token silent - refresh if necessary (handled by msal library)
  const tokenResponse = await msalClient.acquireTokenSilent({
    account: account,
    scopes: MICROSOFT_APP_SCOPES
  });

  // Check if tokenResponse is defined and has an accessToken
  if (!tokenResponse?.accessToken) {
    throw new Error("Failed to acquire an access token");
  }

  // return fresh token
  const msGraphClient = Client.init({
    authProvider: (done) => {
      done(null, tokenResponse?.accessToken);
    }
  });

  return msGraphClient;
}

export async function sendInitialEmail(
  msHomeAccountId: string,
  subject: string,
  body: string,
  fileNames: string[],
  recipientEmail: string
): Promise<{
  newMessageId: string;
  conversationId: string;
}> {
  const msGraphClient = await getMsGraphClient(msHomeAccountId);

  const message: Message = {
    subject: subject,
    body: {
      content: body,
      contentType: "text"
    },
    toRecipients: [
      {
        emailAddress: {
          address: recipientEmail
        }
      }
    ],
    attachments: await constructAttachments(fileNames)
  };

  const draftResponse = (await msGraphClient
    .api("me/messages/")
    .post(message)) as Message;

  if (!draftResponse?.id || !draftResponse?.conversationId) {
    throw new Error("Failed to retrieve messageId or conversationId");
  }

  const newMessageId = draftResponse.id;
  const conversationId = draftResponse.conversationId;

  await msGraphClient.api(`me/messages/${newMessageId}/send`).post({});

  return { newMessageId, conversationId };
}

async function constructAttachments(
  fileNames: string[]
): Promise<Attachment[]> {
  const attachments: Attachment[] = [];
  for (const fileName of fileNames) {
    const file = await getFileFromS3(fileName);

    if (!(file.Body instanceof Buffer)) {
      throw new Error("Data body is not a Buffer");
    }

    const fileBase64 = file.Body?.toString("base64");

    attachments.push({
      "@odata.type": "#microsoft.graph.fileAttachment",
      name: fileName.split("/").pop() ?? "Unnamed File",
      contentBytes: fileBase64
    });
  }

  return attachments;
}

export async function replyEmailAsync(
  msHomeAccountId: string,
  comment: string,
  fileNames: string[],
  recipientEmail: string,
  lastMessageId: string
) {
  const msGraphClient = await getMsGraphClient(msHomeAccountId);

  const reply = {
    message: {
      toRecipients: [
        {
          emailAddress: {
            address: recipientEmail
          }
        }
      ],
      attachments: await constructAttachments(fileNames)
    },
    comment: comment
  };

  await msGraphClient.api(`me/messages/${lastMessageId}/reply`).post(reply);
}

export async function getInboxAsync(
  msHomeAccountId: string,
  conversationId: string
): Promise<PageCollection> {
  const msGraphClient = await getMsGraphClient(msHomeAccountId);
  // TODO: this is not filtered, might cause some issues
  return msGraphClient
    .api(
      `me/mailFolders/inbox/messages?filter=conversationId eq '${conversationId}'`
    )
    .get() as Promise<PageCollection>;
}

export async function getMessageAttachments(
  msHomeAccountId: string,
  messageId: string
): Promise<Attachment[]> {
  const msGraphClient = await getMsGraphClient(msHomeAccountId);
  const result = (await msGraphClient
    .api(`/me/messages/${messageId}/attachments`)
    .get()) as AttachmentsResponse;

  return result.value;
}
