import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// need this when running npm run dev, otherwise causes two user objects
const userCreationCache = new Set<string>();

export const userRouter = createTRPCRouter({
  upsertUser: publicProcedure
    .input(
      z.object({
        clerkUserId: z.string(),
        email: z.string().email()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { clerkUserId, email } = input;

      // Check if the user creation is already in progress
      if (userCreationCache.has(clerkUserId)) {
        return;
      }

      // Add to cache to prevent duplicate creation
      userCreationCache.add(clerkUserId);

      try {
        // Check if the user already exists
        const existingUser = await ctx.db.user.findFirst({
          where: { clerkUserId: clerkUserId }
        });

        if (existingUser) {
          return;
        }

        console.log("Creating new User");
        await ctx.db.user.create({
          data: {
            clerkUserId: clerkUserId,
            email: email
          }
        });

        return;
      } finally {
        // Remove from cache after operation
        userCreationCache.delete(clerkUserId);
      }
    })
});
