import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AWS_BUCKET_NAME, AWS_IMG_URL_BASE, AWS_REGION } from "../config.js";
import { v4 as uuid } from "uuid";

const s3 = new S3Client({
  region: AWS_REGION
});


async function uploadS3({ originalname, buffer, mimetype }) {
  const name = `${uuid()}-${originalname}`;
  
  const params = {
    Bucket: AWS_BUCKET_NAME,
    Key: name,
    Body: buffer,
    ContentType: mimetype
  };

  await s3.send(new PutObjectCommand(params));
  return `${AWS_IMG_URL_BASE}/${name}`;
}

async function readS3() {
  const { Body } = await s3.send(new GetObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: "my-first-object.txt"
  }));

  console.log(await Body.transformToString());
}

// upload();
// read();
export { uploadS3, readS3 };
