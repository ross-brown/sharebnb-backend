import { db } from "../db.js";
import { NotFoundError } from "../expressError.js";

/** Model for messages */
class Message {
  /**
   *  Create a new message
   *  Returns { id, recipient, sender, body, sentAt }
   *
   */
  static async create({sender, recipient, body}){
    const result = await db.query(`
      INSERT INTO messages (user_to, user_from, body, sent_at)
      VALUES ($1, $2, $3, current_timestamp)
      RETURNING message_id AS "id",
                user_to AS "recipient",
                user_from AS "sender",
                body,
                sent_at AS "sentAt"`, [
        recipient, sender, body
      ])

    return result.rows[0];
  }

  /** Get a message by id
   *
   *  Returns { id, recipient, sender, body, sentAt }
   */
  static async get(id){
    const result = await db.query(`
    SELECT message_id AS "id",
           user_to AS "recipient",
           user_from AS "sender",
           body,
           sent_at AS "sentAt"
    FROM messages
    WHERE message_id = $1`, [id]);

    let message = result.rows[0];

    if (!message) throw new NotFoundError(`No such message: ${id}`)

    return message;
  }
}

export default Message;