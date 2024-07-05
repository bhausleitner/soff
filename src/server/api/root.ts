import { supplierRouter } from "~/server/api/routers/supplier";
import { chatRouter } from "~/server/api/routers/chat";
import { postRouter } from "~/server/api/routers/post";
import { partRouter } from "~/server/api/routers/part";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  supplier: supplierRouter,
  chat: chatRouter,
  part: partRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
