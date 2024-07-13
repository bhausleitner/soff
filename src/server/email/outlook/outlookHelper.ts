import { Client } from "@microsoft/microsoft-graph-client";
import { type Message } from "@microsoft/microsoft-graph-types";
import {
  ConfidentialClientApplication,
  type AuthorizationUrlRequest,
  type Configuration,
  type AuthorizationCodeRequest
} from "@azure/msal-node";

let _graphClient: Client | undefined = undefined;
let _urlParameters: AuthorizationUrlRequest;
let _tokenRequest: AuthorizationCodeRequest;
const _msalConfig: Configuration = {
  auth: {
    clientId: process.env.MICROSOFT_APP_CLIENT_ID!,
    authority: "https://login.microsoftonline.com/common/",
    clientSecret: process.env.MICROSOFT_APP_CLIENT_SECRET
  }
};

const MICROSOFT_APP_REDIRECT_URI =
  "http://localhost:3000/api/graphMicrosoftCallback";

const MICROSOFT_APP_SCOPES = [
  "user.read",
  "mailboxsettings.read",
  "mail.read",
  "mail.send"
];
const _msalClient = new ConfidentialClientApplication(_msalConfig);

export async function initMicrosoftAuthUrl(): Promise<string> {
  _urlParameters = {
    scopes: MICROSOFT_APP_SCOPES,
    redirectUri: MICROSOFT_APP_REDIRECT_URI
  };

  return await _msalClient.getAuthCodeUrl(_urlParameters);
}

export async function initGraphClient(queryCode: string) {
  // get accessToken from _msalClient
  _tokenRequest = {
    code: queryCode,
    scopes: MICROSOFT_APP_SCOPES,
    redirectUri: MICROSOFT_APP_REDIRECT_URI
  };

  // request token from MSAL Client
  const response = await _msalClient.acquireTokenByCode(_tokenRequest);

  // initialize Microsoft Graph API Client
  _graphClient = Client.init({
    authProvider: (done) => {
      done(null, response.accessToken);
    }
  });
}

export async function sendMailAsync(
  subject: string,
  body: string,
  recipientEmail: string
) {
  // Ensure client isn't undefined
  if (!_graphClient) {
    throw new Error("Graph has not been initialized for user auth");
  }

  // Create a new message
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

  // Send the message
  return _graphClient.api("me/sendMail").post({
    message: message
  });
}
