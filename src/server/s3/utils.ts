import s3 from "~/server/s3/config";
import { type Attachment } from "~/server/email/outlook/outlookHelper";
import { type Message } from "@prisma/client";
import { db } from "~/server/db";

export async function uploadFileToS3(
  attachments: Attachment[],
  s3FolderPrefix: string,
  messageObject: Message
) {
  const promises = attachments.map(async (attachment) => {
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

    await db.message.update({
      where: {
        id: messageObject.id
      },
      data: {
        fileNames: {
          push: name
        }
      }
    });
  });

  await Promise.all(promises);
}
