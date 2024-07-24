import { Client } from "@microsoft/microsoft-graph-client";
import { type Message } from "@microsoft/microsoft-graph-types";
import {
  type AuthorizationUrlRequest,
  type AuthorizationCodeRequest
} from "@azure/msal-node";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { msalClient } from "./initMsalClient";

const MICROSOFT_APP_REDIRECT_ROUTE = "/api/graphMicrosoftCallback";

const MICROSOFT_APP_SCOPES = [
  "user.read",
  "mailboxsettings.read",
  "mail.read",
  "mail.send"
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

export async function sendMailAsync(
  msHomeAccountId: string,
  subject: string,
  body: string,
  recipientEmail: string
) {
  // get Microsoft Graph Client
  const msGraphClient = await getMsGraphClient(msHomeAccountId);

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

  // send the message
  return msGraphClient.api("me/sendMail").post({
    message: message
  });
}
