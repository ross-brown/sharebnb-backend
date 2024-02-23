"use strict";

const Listing = require("../models/listing");
const Message = require("../models/message");
const User = require("../models/user");
const db = require("../db");
const { createToken } = require("../helpers/token");

const testListingIds = [];
const testMessageIds = [];
const testBookingIds = [];

async function commonBeforeAll() {
  //delete all messages and users
  await db.query("DELETE FROM messages");
  await db.query("DELETE FROM users");

  // create test users
  await User.register({
    username: "u1",
    password: "password1",
    firstName: "U1F",
    lastName: "U1L",
    email: "u1@email.com"
  });
  await User.register({
    username: "u2",
    password: "password2",
    firstName: "U2F",
    lastName: "U2L",
    email: "u2@email.com"
  });
  await User.register({
    username: "u3",
    password: "password3",
    firstName: "U3F",
    lastName: "U3L",
    email: "u3@email.com"
  });

  // create test listings
  testListingIds[0] = (await Listing.create({
    title: "l1",
    type: "yard",
    photoUrl: null,
    price: 100,
    description: "very cool",
    location: "Austin",
    ownerUsername: "u1"
  })).id;
  testListingIds[1] = (await Listing.create({
    title: "l2",
    type: "treehouse",
    photoUrl: null,
    price: 100,
    description: "very tall",
    location: "Dallas",
    ownerUsername: "u2"
  })).id;
  testListingIds[2] = (await Listing.create({
    title: "l3",
    type: "pool",
    photoUrl: null,
    price: 100,
    description: "very nice",
    location: "NYC",
    ownerUsername: "u3"
  })).id;

  // create test messages
  testMessageIds[0] = (await Message.create({
    sender: "u1", recipient: "u2", body: "hello"
  })).id;
  testMessageIds[1] = (await Message.create({
    sender: "u2", recipient: "u1", body: "hey"
  })).id;


  // create test bookings
  const listing1 = await Listing.get(testListingIds[0]);
  const listing2 = await Listing.get(testListingIds[1]);

  testBookingIds[0] = (await listing1.book("u2")).listing_id;
  testBookingIds[1] = (await listing2.book("u1")).listing_id;
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

const u1Token = createToken({ username: "u1" });
const u2Token = createToken({ username: "u2" });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testListingIds,
  testMessageIds,
  testBookingIds,
  u1Token,
  u2Token
};
