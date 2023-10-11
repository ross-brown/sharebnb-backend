/** Routes for users */

import express from "express";
import User from "../models/user.js";
import jsonschema from "jsonschema";
import newUserSchema from '../schemata/userNew.json' assert {type: 'json'};
import updateUserSchema from '../schemata/userUpdate.json' assert {type: 'json'};
import { createToken } from "../helpers/token.js";

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
 *  where User is { username, firstName, lastName, email, listings, bokkings }
 */
router.get("/:username", async function (req, res, next) {
  const user = await User.get(req.params.username);
  return res.json({ user });
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
router.patch("/:username", async function (req, res, next) {
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
router.delete("/:username", async function (req, res, next) {
  const user = await User.get(req.params.username);
  await user.delete();

  return res.json({ deleted: req.params.username });
});

export default router;