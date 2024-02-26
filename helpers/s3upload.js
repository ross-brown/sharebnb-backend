const { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { AWS_BUCKET_NAME, AWS_IMG_URL_BASE, AWS_REGION } = require("../config.js");
const { v4: uuid } = require("uuid");

const s3 = new S3Client({
  region: AWS_REGION
});


/** uploads a file to s3 and return URL `[AWS_BASE_URL]/2j3k4l-photo */
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

async function deleteS3(url) {
  const fileName = url.replace(`${AWS_IMG_URL_BASE}/`, "");

  const params = {
    Bucket: AWS_BUCKET_NAME,
    Key: fileName
  };

  await s3.send(new DeleteObjectCommand(params));
}


module.exports = { uploadS3, deleteS3 };
