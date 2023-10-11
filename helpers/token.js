import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config";

/** Return signed JWT {username} from user data. */

function createToken(user) {
  let payload = {
    username: user.username
  }

  return jwt.sign(payload, SECRET_KEY)
}

export { createToken };