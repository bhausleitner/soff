import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import s3 from "~/server/s3/config";
import { getFileFromS3 } from "~/server/s3/utils";

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
    }),
  generateUploadUrl: publicProcedure
    .input(z.object({ fileKey: z.string(), fileType: z.string() }))
    .mutation(async ({ input }) => {
      const { fileKey, fileType } = input;
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileKey,
        ContentType: fileType
      };
      return { uploadUrl: s3.getSignedUrl("putObject", params) };
    }),
  generateUploadUrls: publicProcedure
    .input(
      z.array(
        z.object({
          fileKey: z.string(),
          fileType: z.string()
        })
      )
    )
    .mutation(async ({ input }) => {
      const uploadUrls = await Promise.all(
        input.map(async ({ fileKey, fileType }) => {
          const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileKey,
            ContentType: fileType
          };

          return s3.getSignedUrlPromise("putObject", params);
        })
      );

      return { uploadUrls };
    }),
  deleteFile: publicProcedure
    .input(
      z.object({
        fileKey: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const bucket = process.env.AWS_S3_BUCKET;
      if (!bucket) {
        throw new Error("AWS_S3_BUCKET environment variable is not set.");
      }

      const params = {
        Bucket: bucket,
        Key: input.fileKey
      };

      try {
        await s3.deleteObject(params).promise();
        return { success: true };
      } catch (error) {
        console.error("Error deleting file:", error);
        throw new Error("Failed to delete file.");
      }
    }),
  downloadFile: publicProcedure
    .input(z.object({ fileKey: z.string() }))
    .mutation(async ({ input }) => {
      const file = await getFileFromS3(input.fileKey);
      if (!(file?.Body instanceof Buffer)) {
        throw new Error("File not found or invalid file type");
      }
      return {
        content: file.Body.toString("base64"),
        contentType: file.ContentType,
        fileName: input.fileKey.split("/").pop() ?? "download"
      };
    })
});
