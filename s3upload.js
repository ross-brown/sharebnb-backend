import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { BUCKET_REGION, S3_BUCKET } from "./config.js";

const s3Client = new S3Client({ region: "us-east-1" });


async function upload() {
  await s3Client.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: "my-first-object.txt",
    Body: "Hello World!"
  }));
}

async function read() {
  const { Body } = await s3Client.send(new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: "my-first-object.txt"
  }));

  console.log(await Body.transformToString());
}

// upload();
read();
