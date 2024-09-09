import { clerkClient } from "@clerk/clerk-sdk-node";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// need this when running npm run dev, otherwise causes two user objects
const userCreationCache = new Set<string>();

export const userRouter = createTRPCRouter({
  getEmailProvider: publicProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findFirst({
      where: { clerkUserId: ctx.auth.userId! },
      select: {
        organization: {
          select: {
            emailProvider: true
          }
        }
      }
    });
    return user?.organization?.emailProvider;
  }),
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

        const organization = await ctx.db.organization.findFirst({
          where: {
            name: {
              equals: email.split("@")[1]?.split(".")[0],
              mode: "insensitive"
            }
          },
          select: {
            id: true,
            emailProvider: true,
            name: true
          }
        });

        await ctx.db.user.create({
          data: {
            clerkUserId: clerkUserId,
            email: email,
            organizationId: organization?.id
          }
        });

        // todo move after user creation
        await clerkClient?.users.updateUserMetadata(clerkUserId, {
          publicMetadata: {
            syncedToDB: true,
            emailProvider: organization?.emailProvider ?? "unknown",
            organization: organization?.name ?? "unknown"
          }
        });

        return;
      } finally {
        // Remove from cache after operation
        userCreationCache.delete(clerkUserId);
      }
    })
});
