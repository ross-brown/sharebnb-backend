import express from "express";
import Message from "../models/message.js";
import jsonschema from "jsonschema";
import newMessageSchema from "../schemata/messageNew.json" assert {type: "json"};
import { ensureLoggedIn } from "../middleware/auth.js";
import { UnauthorizedError, BadRequestError } from "../expressError.js";

const router = express.Router();


/** POST /messages
 *
 *  Create a new message
 *  {recipient, body} => {id, sender, recipient, body, sentAt}
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    newMessageSchema,
    { required: true });

 if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
 }

  const message = await Message.create({
    sender: res.locals.user.username,
    recipient: req.body.recipient,
    body: req.body.body
  });

  return res.json({ message })
});

/** GET /[id] - get a specific message
 *
 *  Returns { id, sender, recipient, body, sentAt }
 */
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  const username = res.locals.user.username
  const message = await Message.get(req.params.id);

  if (message.sender !== username && message.recipient !== username) {
    throw new UnauthorizedError("Cannot read this message");
  }

  return res.json({ message })
})

export default router;