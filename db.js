"use strict";

/** Database setup for ShareBnB */

const pg = require("pg");
const { getDatabaseUri } = require("./config.js");

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

module.exports =  db;
