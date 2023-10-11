
/** Database setup for ShareBnB */

import pg from "pg";
import { getDatabaseUri } from "./config.js";

const databaseUri = getDatabaseUri();

const db = new pg.Client({
  connectionString: databaseUri
});

async function connectDb() {
  try {
    await db.connect();
    console.log(`Connected to ${databaseUri}`);
  } catch (error) {
    console.error(`Couldn't connect to ${databaseUri}`, error.message);
    process.exit(1);
  }
}
connectDb();

export { db };
