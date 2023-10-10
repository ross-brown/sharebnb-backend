
import { db } from "../db";
import bcrypt from "bcrypt";
import { BCRYPT_WORK_FACTOR } from "../config";
import { UnauthorizedError } from "../expressError";



class User {




  /** authenticate user with username/password
   *
   * Returns {username, firstName, lastName, email}
   *
   * Throws UnauthorizedError if no user found in DB or wrong password
   */
  static async authenticate(username, password) {

    const result = await db.query(`
        SELECT username,
               password,
               first_name AS "firstName",
               last_name AS "lastName",
               email
        FROM users
        WHERE username = $1`, [username]);

    const user = result.rows[0];

    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

}
