const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError.js");

/** Model for messages */
class Message {
  /**
   *  Create a new message
   *  Returns { id, recipient, sender, body, sentAt }
   *
   */
  static async create({ sender, recipient, body }) {
    console.log("sender=", sender, "rec=", recipient);
    const recipientCheck = await db.query(`
              SELECT username
              FROM users
              WHERE username = $1`,
      [recipient]);

    const validRec = recipientCheck.rows[0];

    if (!validRec) {
      console.log("no recipient", recipient);
      throw new BadRequestError(`Can't send to ${recipient}`);
    }

    const result = await db.query(`
      INSERT INTO messages (user_to, user_from, body, sent_at)
      VALUES ($1, $2, $3, current_timestamp)
      RETURNING message_id AS "id",
                user_to AS "recipient",
                user_from AS "sender",
                body,
                sent_at AS "sentAt"`, [
      recipient, sender, body
    ]);

    return result.rows[0];
  }

  /** Get a message by id
   *
   *  Returns { id, recipient, sender, body, sentAt }
   */
  static async get(id) {
    const result = await db.query(`
    SELECT message_id AS "id",
           user_to AS "recipient",
           user_from AS "sender",
           body,
           sent_at AS "sentAt"
    FROM messages
    WHERE message_id = $1`, [id]);

    let message = result.rows[0];

    if (!message) throw new NotFoundError(`No such message: ${id}`);

    return message;
  }
}

module.exports = Message;
