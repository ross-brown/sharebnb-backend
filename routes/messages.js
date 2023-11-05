const express = require("express");
const Message = require("../models/message.js");
const jsonschema = require("jsonschema");
const newMessageSchema = require("../schemata/messageNew.json");
const { ensureLoggedIn } = require("../middleware/auth.js");
const { UnauthorizedError, BadRequestError } = require("../expressError.js");

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

  return res.json({ message });
});

/** GET /[id] - get a specific message
 *
 *  Returns { id, sender, recipient, body, sentAt }
 */
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  const username = res.locals.user.username;
  const message = await Message.get(req.params.id);

  if (message.sender !== username && message.recipient !== username) {
    throw new UnauthorizedError("Cannot read this message");
  }

  return res.json({ message });
});

module.exports = router;
