
import { db } from "../db";
import bcrypt from "bcrypt";
import { BCRYPT_WORK_FACTOR } from "../config";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../expressError";



class User {
  constructor({ username, firstName, lastName, email }) {
    this.username = username,
      this.firstName = firstName,
      this.lastName = lastName,
      this.email = email;
  }

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
        return new User(user);
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Return { username, firstName, lastName, email }
   *
   * Throws BadRequestError for duplicate username.
  */
  static async register({ username, password, firstName, lastName, email }) {
    const duplicateCheck = await db.query(`
      SELECT username
      FROM users
      WHERE username = $1`, [username]);

    if (duplicateCheck.rows.length > 0) {
      throw new BadRequestError(`Username ${username} already taken`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(`
      INSERT INTO users (username, password, first_name, last_name, email)
      VALUES ($1, $2, $3, $4. $5)
      RETURNING
        username,
        first_name AS "firstName",
        last_name AS "lastName",
        email`, [
      username, hashedPassword, firstName, lastName, email]);

    const user = result.rows[0];

    return new User(user);
  }

  /** Get a list of all users
   *
   *  Returns [{ username, firstName, lastName, email }, ...]
  */
  static async findAll() {
    const result = await db.query(`
        SELECT username,
            first_name AS "firstName",
            last_name  AS "lastName",
            email
        FROM users
        ORDER BY username`);

    return result.rows.map(user => new User(user));
  }

  /** Get a user by username
   *
   *  Return {username, firstName, lastName, email, bookings, listings}
   *   where listings : [ listingId, title, type ]
   *   where booking : [ listingId, userId ]
   *
   *  ThrowNotFoundError if user not found
   */
  static async get(username) {
    const userRes = await db.query(`
        SELECT username,
               first_name AS "firstName",
               last_name AS "lastName",
               email
        FROM users
        WHERE username = $1`, [username]);

    const userData = userRes.rows[0];

    if (!userData) throw new NotFoundError(`No user: ${username}`);

    const listingRes = await db.query(`
        SELECT id AS listingId, title, type
        FROM listings
        WHERE owner_username = $1`, [username]);

    const bookingRes = await db.query(`
        SELECT username, listing_id AS listingId
        FROM bookings
        WHERE username = $1`, [username]);

    const user = new User(userData);

    user.listings = listingRes.rows;
    user.bookings = bookingRes.rows;

    return user;
  }

  /** Update user with data
   *
   *  Returns { username, firstName, lastName, email }
   */
  async save() {
    const result = db.query(`
      UPDATE users
      SET first_name = $1,
          last_name = $2,
          email = $3
      WHERE username = $4
      RETURNING username,
          first_name AS firstName,
          last_name AS lastName,
          email`,
      [this.firstName, this.lastName, this.email, this.username]);

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${this.username}`);

    return new User(user);
  }

  /** Delete user; returns undefined */
  async delete() {
    const result = await db.query(`
        DELETE
        FROM users
        WHERE username = $1
        RETURNING username`, [this.username],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${this.username}`);
  }
}

export default User;
