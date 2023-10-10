import "dotenv/config";

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";
const PORT = +process.env.PORT || 3001;

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const BUCKET_REGION = process.env.BUCKET_REGION

function getDatabaseUri() {
  return (process.env.NODE_ENV === "test")
      ? "postgresql:///sharebnb_test"
      : process.env.DATABASE_URL || "postgresql:///sharebnb";
}

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

export {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET_NAME,
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  BUCKET_REGION,
  getDatabaseUri
};
