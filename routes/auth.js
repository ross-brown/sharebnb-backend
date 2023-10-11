/** Routes for authentication. */

import express from "express";
import User from "../models/user.js";
import jsonschema from "jsonschema";
import userAuthSchema from "../schemata/userAuth.json" assert {type: "json"};
import userNewScehma from "../schemata/userNew.json" assert {type: "json"};
import { createToken } from "../helpers/token.js";
import { BadRequestError } from "../expressError.js";


const router = express.Router();



/** POST /auth/token: { username, password } => { token }
 *
 * Returns a JWT to authenticate future requests
 *
 * Authorization required: none
 */
router.post("/token", async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    userAuthSchema,
    { required: true }
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const { username, password } = req.body;
  const user = await User.authenticate(username, password);
  const token = createToken(user);
  return res.json({ token });
});


/** POST /auth/register: { user } => { token }
 *
 * user must have {username, password, firstName, lastName, email }
 *
 * Returns a JWT to authenticate future requests
 *
 * Authorization required: none
 */

router.post("/register", async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    userNewScehma,
    { required: true }
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const newUser = await User.register(req.body);
  const token = createToken(newUser);
  return res.status(201).json({ token });
});


export default router;
