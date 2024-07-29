import s3 from "~/server/s3/config";
import { type Attachment } from "~/server/email/outlook/outlookHelper";
import { type Message } from "@prisma/client";
import { db } from "~/server/db";
import { type S3 } from "aws-sdk";

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

export async function getFileFromS3(fileKey: string) {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    throw new Error("AWS_S3_BUCKET environment variable is not defined");
  }

  const params = {
    Bucket: bucket,
    Key: fileKey
  };

  const data = await s3.getObject(params).promise();
  if (!data.Body) {
    throw new Error("Failed to retrieve file from S3");
  }

  return data as S3.GetObjectOutput;
}
