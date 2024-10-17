import { supplierRouter } from "~/server/api/routers/supplier";
import { chatRouter } from "~/server/api/routers/chat";
import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { quoteRouter } from "~/server/api/routers/quote";
import { userRouter } from "./routers/user";
import { s3Router } from "./routers/s3";
import { rfqRouter } from "./routers/rfq";
import { productRouter } from "./routers/product";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  product: productRouter,
  post: postRouter,
  supplier: supplierRouter,
  chat: chatRouter,
  user: userRouter,
  quote: quoteRouter,
  s3: s3Router,
  rfq: rfqRouter
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
