import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AWS_BUCKET_NAME } from "./config.js";

const s3 = new S3Client();


async function upload() {
  await s3.send(new PutObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: "my-first-object.txt",
    Body: "Hello World!"
  }));
}

async function read() {
  const { Body } = await s3.send(new GetObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: "my-first-object.txt"
  }));

  console.log(await Body.transformToString());
}

// upload();
read();
