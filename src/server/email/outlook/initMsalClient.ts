import {
  ConfidentialClientApplication,
  type Configuration
} from "@azure/msal-node";
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

export const msalClient = new ConfidentialClientApplication(_msalConfig);
