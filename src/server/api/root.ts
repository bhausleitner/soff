import { supplierRouter } from "~/server/api/routers/supplier";
import { chatRouter } from "~/server/api/routers/chat";
import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { partRouter } from "~/server/api/routers/part";
import { quoteRouter } from "~/server/api/routers/quote";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  supplier: supplierRouter,
  part: partRouter,
  chat: chatRouter,
  user: userRouter,
  quote: quoteRouter
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
