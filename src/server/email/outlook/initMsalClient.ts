import {
  ConfidentialClientApplication,
  type Configuration
} from "@azure/msal-node";
import { GlobalRef } from "~/utils/GlobalRef";

const _msalConfig: Configuration = {
  auth: {
    clientId: process.env.MICROSOFT_APP_CLIENT_ID!,
    authority: "https://login.microsoftonline.com/common/",
    clientSecret: process.env.MICROSOFT_APP_CLIENT_SECRET
  }
};

function initMsalClient() {
  return new ConfidentialClientApplication(_msalConfig);
}

const globalMsalClientConnection = new GlobalRef<ConfidentialClientApplication>(
  "myapp.ConfidentialClientApp"
);
if (!globalMsalClientConnection.value) {
  globalMsalClientConnection.value = initMsalClient();
}

export const msalClient: ConfidentialClientApplication =
  globalMsalClientConnection.value;
