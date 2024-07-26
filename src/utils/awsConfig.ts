// lib/awsConfig.js
import AWS from "aws-sdk";

AWS.config.update({
  region: process.env.AWS_REGION,
  credentials: new AWS.Credentials(
    process.env.AWS_ACCESS_KEY!,
    process.env.AWS_SECRET_ACCESS_KEY!
  )
});

const s3 = new AWS.S3();

export default s3;
