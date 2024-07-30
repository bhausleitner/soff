import { createNextApiHandler } from "@trpc/server/adapters/next";
import { env } from "~/env";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import * as Sentry from "@sentry/nextjs";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError: ({ path, error }) => {
    // Log error to console in development
    if (env.NODE_ENV === "development") {
      console.error(
        `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
      );
    }

    // Log error to Sentry in all environments
    Sentry.withScope((scope: Sentry.Scope) => {
      scope.setTag("path", path ?? "<no-path>");
      scope.setLevel("error");
      Sentry.captureException(error);
    });
  }
});
