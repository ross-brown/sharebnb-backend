"use strict";

const bcrypt = require("bcrypt");

const db = require("../db");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testListingIds = [];
const testBookingIds = [];
const testMessageIds = [];

async function commonBeforeAll() {
  //delete all messages and users
  await db.query("DELETE FROM messages");
  await db.query("DELETE FROM users");

  //create test users
  await db.query(`
      INSERT INTO users(username, password, first_name, last_name, email)
      VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
             ('u2', $2, 'U2F', 'U2L', 'u2@email.com'),
             ('u3', $3, 'U3F', 'U3L', 'u3@email.com')
      RETURNING username`, [
    await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
    await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
    await bcrypt.hash("password3", BCRYPT_WORK_FACTOR),
  ]);

  //create test listings
  const resultListings = await db.query(`
      INSERT INTO listings(title, type, price, description, location, owner_username)
      VALUES ('l1', 'yard', 100, 'very nice', 'Austin', 'u1'),
             ('l2', 'treehouse', 100, 'very tall', 'Dallas', 'u2'),
             ('l3', 'pool', 100, 'very cool', 'NYC', 'u3')
      RETURNING id`);
  testListingIds.splice(0, 0, ...resultListings.rows.map(r => r.id));

  //create test messages
  const resultMessages = await db.query(`
      INSERT INTO messages(user_to, user_from, body, sent_at)
      VALUES ('u1', 'u2', 'hello', '2024-01-26 15:47:44.1'),
             ('u2', 'u1', 'hey', '2024-01-27 15:47:44.1')
      RETURNING message_id
  `);
  testMessageIds.splice(0, 0, ...resultMessages.rows.map(r => r.message_id));

  //create test bookings
  const resultBookings = await db.query(`
      INSERT INTO bookings(username, listing_id)
      VALUES ('u1', $1),
             ('u2', $2)
      RETURNING listing_id`,
    [testListingIds[1], testListingIds[0]]
  );
  testBookingIds.splice(0, 0, ...resultBookings.rows.map(r => r.listing_id));
}


async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testListingIds,
  testBookingIds,
  testMessageIds
};
