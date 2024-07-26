import s3 from "~/server/s3/config";
import { type Attachment } from "~/server/email/outlook/outlookHelper";

export async function uploadToS3(
  attachments: Attachment[],
  s3FolderPrefix: string
) {
  const uploadPromises = attachments.map(async (attachment) => {
    const { name, contentBytes, contentType } = attachment;
    const buffer = Buffer.from(contentBytes, "base64");
    const s3Key = `${s3FolderPrefix}${name}`;

    await s3
      .upload({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key,
        Body: buffer,
        ContentType: contentType
      })
      .promise();
  });

  await Promise.all(uploadPromises);
}
