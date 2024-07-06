import "isomorphic-fetch";
import {
  DeviceCodeCredential,
  type DeviceCodePromptCallback
} from "@azure/identity";
import { Client, type PageCollection } from "@microsoft/microsoft-graph-client";
import { type User, type Message } from "@microsoft/microsoft-graph-types";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { type DeviceCodeInfo } from "@azure/identity";

interface AppSettings {
  clientId: string;
  tenantId: string;
  graphUserScopes: string[];
}

interface SendEmailProps {
  subject: string;
  body: string;
  recipientEmail: string;
}

// static for now, these need to be updated per User
const settings: AppSettings = {
  clientId: "39c77597-a192-465c-9591-6ff0bdaf7376",
  tenantId: "039f5954-b785-4758-8aca-abe31da2fd9f",
  graphUserScopes: ["user.read", "mail.read", "mail.send"]
};

let _deviceCodeCredential: DeviceCodeCredential | undefined = undefined;
let _userClient: Client | undefined = undefined;

export function initializeGraphForUserAuth(
  settings: AppSettings,
  deviceCodePrompt: DeviceCodePromptCallback
) {
  if (!settings) {
    throw new Error("Settings cannot be undefined");
  }

  _deviceCodeCredential = new DeviceCodeCredential({
    clientId: settings.clientId,
    tenantId: settings.tenantId,
    userPromptCallback: deviceCodePrompt
  });

  const authProvider = new TokenCredentialAuthenticationProvider(
    _deviceCodeCredential,
    {
      scopes: settings.graphUserScopes
    }
  );

  _userClient = Client.initWithMiddleware({
    authProvider: authProvider
  });
}

export async function getUserAsync(): Promise<User> {
  if (!_userClient) {
    throw new Error("Graph has not been initialized for user auth");
  }

  // adding "as Promise<User> here, since .get() typically returns Promise<any>"
  return _userClient
    .api("/me")
    .select(["displayName", "mail", "userPrincipalName"])
    .get() as Promise<User>;
}

export async function getInboxAsync(): Promise<PageCollection> {
  if (!_userClient) {
    throw new Error("Graph has not been initialized for user auth");
  }

  // adding "as Promise<PageCollection> here, since .get() typically returns Promise<any>"
  return _userClient
    .api("/me/mailFolders/inbox/messages")
    .select(["from", "isRead", "receivedDateTime", "subject", "body"])
    .top(1)
    .orderby("receivedDateTime DESC")
    .get() as Promise<PageCollection>;
}

export async function sendMailAsync(emailProps: SendEmailProps) {
  // Ensure client isn't undefined
  if (!_userClient) {
    initializeGraphForUserAuth(settings, (info: DeviceCodeInfo) => {
      // Display the device code message to
      // the user. This tells them
      // where to go to sign in and provides the
      // code to use.
      console.log(info.message);
      console.log();
    });
    throw new Error("Graph has not been initialized for user auth");
  }

  // Create a new message
  const message: Message = {
    subject: emailProps.subject,
    body: {
      content: emailProps.body,
      contentType: "text"
    },
    toRecipients: [
      {
        emailAddress: {
          address: emailProps.recipientEmail
        }
      }
    ]
  };

  // Send the message
  return _userClient.api("me/sendMail").post({
    message: message
  });
}
