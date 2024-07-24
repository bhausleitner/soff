import {
  ConfidentialClientApplication,
  type Configuration
} from "@azure/msal-node";
import { GlobalRef } from "~/utils/GlobalRef";
import { db } from "~/server/db";

const _msalConfig: Configuration = {
  auth: {
    clientId: process.env.MICROSOFT_APP_CLIENT_ID!,
    authority: "https://login.microsoftonline.com/common/",
    clientSecret: process.env.MICROSOFT_APP_CLIENT_SECRET
  },
  cache: {
    cachePlugin: {
      beforeCacheAccess: async (cacheContext) => {
        const cacheRecord = await db.msalTokenCache.findUnique({
          where: { clientId: process.env.MICROSOFT_APP_CLIENT_ID! }
        });
        if (cacheRecord) {
          cacheContext.tokenCache.deserialize(cacheRecord.cache);
        }
      },
      afterCacheAccess: async (cacheContext) => {
        if (cacheContext.cacheHasChanged) {
          const serializedCache = cacheContext.tokenCache.serialize();
          await db.msalTokenCache.upsert({
            where: { clientId: process.env.MICROSOFT_APP_CLIENT_ID! },
            update: { cache: serializedCache },
            create: {
              clientId: process.env.MICROSOFT_APP_CLIENT_ID!,
              cache: serializedCache
            }
          });
        }
      }
    }
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
