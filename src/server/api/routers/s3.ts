import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import s3 from "~/server/s3/config";

export const s3Router = createTRPCRouter({
  getSignedUrl: publicProcedure
    .input(
      z.object({
        fileKey: z.string()
      })
    )
    .query(async ({ input }) => {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: input.fileKey,
        Expires: 3600
      };

      return { signedUrl: s3.getSignedUrl("getObject", params) };
    })
});
