import { Client, type PageCollection } from "@microsoft/microsoft-graph-client";
import { type Message } from "@microsoft/microsoft-graph-types";
import {
  type AuthorizationUrlRequest,
  type AuthorizationCodeRequest
} from "@azure/msal-node";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { msalClient } from "~/server/email/outlook/initMsalClient";
import { get } from "lodash";
import { db } from "~/server/db";

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

export async function sendInitialEmailAsync(
  msHomeAccountId: string,
  messageId: string,
  message: Message
): Promise<void> {
  const msGraphClient = await getMsGraphClient(msHomeAccountId);
  await msGraphClient.api(`me/messages/${messageId}/send`).post(message);
}

export function createMessage(
  subject: string,
  body: string,
  recipientEmail: string
): Message {
  // construct a new message
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
    ]
  };

  return message;
}

export async function createDraftAsync(
  msHomeAccountId: string,
  message: Message
): Promise<{ messageId: string; conversationId: string }> {
  const msGraphClient = await getMsGraphClient(msHomeAccountId);

  // create a message draft object in outlook
  const draftResponse = (await msGraphClient
    .api("me/messages/")
    .post(message)) as Promise<PageCollection>;

  const messageId = get(draftResponse, "id");
  const conversationId = get(draftResponse, "conversationId");

  if (!messageId || !conversationId) {
    throw new Error("Failed to retrieve messageId or conversationId");
  }

  return { messageId, conversationId };
}

export async function getInboxAsync(
  msHomeAccountId: string
): Promise<PageCollection> {
  const msGraphClient = await getMsGraphClient(msHomeAccountId);
  return msGraphClient
    .api("me/mailFolders/inbox/messages")
    .top(2)
    .orderby("receivedDateTime DESC")
    .get() as Promise<PageCollection>;
}
