"use strict";

/** Routes for users */

const express = require("express");
const User = require("../models/user.js");
const jsonschema = require("jsonschema");
const newUserSchema = require('../schemata/userNew.json');
const updateUserSchema = require('../schemata/userUpdate.json');
const { createToken } = require("../helpers/token.js");
const { ensureCorrectUser } = require("../middleware/auth.js");

const router = express.Router();

/**
 *  GET /users
 *
 *  Returns list of users { users: [ { User }, ... ]}
 *  where User is { username, firstName, lastName, email }
 */
router.get("/", async function (req, res, next) {
  const users = await User.findAll();
  return res.json({ users });
});

/**
 *  GET /users/:username
 *
 *  Returns an instance of a user like {user: { User }}
 *  where User is { username, firstName, lastName, email, listings, bookings }
 *   where listings is [ listingId, title, price, photUrl ]
 *   where bookings is [ listingId, title, price, photUrl ]
 */
router.get("/:username", async function (req, res, next) {
  const user = await User.get(req.params.username);
  return res.json({ user });
});


/** GET /users/:username/inbox
 *
 * Returns messages recieved by user like
 *  {messages: [{id, sender, recipient, body, sentAt}, .....]}
 *
 * Authorization: correct user
 */
router.get("/:username/inbox", ensureCorrectUser, async function (req, res, next) {
  const user = await User.get(req.params.username);
  const messages = await user.getReceivedMessages();

  return res.json({ messages });
});


/** GET /users/:username/sent
 *
 * Returns messages sent by user like
 *  {messages: [{id, sender, recipient, body, sentAt}, .....]}
 *
 * Authorization: correct user
 */
router.get("/:username/sent", ensureCorrectUser, async function (req, res, next) {
  const user = await User.get(req.params.username);
  const messages = await user.getSentMessages();

  return res.json({ messages });
});



/** POST /users
 *
 *  Add a new user (not the registration route!)
 *
 *  Returns new user instance { user, firstName, lastName, email }
 */
router.post("/", async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    newUserSchema,
    { required: true },
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const user = await User.register(req.body);
  const token = createToken(user);
  return res.status(201).json({ user, token });
});

/** PATCH /users
 *
 *  Updates a user first name, last name, and/or email
 *
 *  Returns instance of User with updated info
 *  {user : { username, firstName, lastName, email }}
 */
router.patch("/:username", ensureCorrectUser, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    updateUserSchema,
    { required: true },
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const userRes = await User.get(req.params.username);
  Object.keys(req.body).map(key => userRes[key] = req.body[key]);
  const user = await userRes.save();

  return res.json({ user });
});

/** DELETE /users
 *
 *  Deletes a user, returns { deleted: username }
 */
router.delete("/:username", ensureCorrectUser, async function (req, res, next) {
  const user = await User.get(req.params.username);
  await user.delete();

  return res.json({ deleted: req.params.username });
});

module.exports = router;
