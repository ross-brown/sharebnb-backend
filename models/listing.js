import { db } from "../db.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../expressError.js";



class Listing {
  constructor({ id, title, type, photoUrl, price, description, location, ownerUsername }) {
    this.id = id;
    this.title = title;
    this.type = type;
    this.photoUrl = photoUrl;
    this.price = price;
    this.description = description;
    this.location = location;
    this.ownerUsername = ownerUsername;
  }




  /** Create a listing (from data), update db, return new listing data.
    *
    * data should be { title, type, photoUrl, price, description, location, ownerUsername }
    *
    * Throws NotFoundError if the user does not exist.
    *
    * Returns { id, title, type, photoUrl, price, description, location, ownerUsername }
    **/
  static async create({ title, type, photoUrl, price, description, location, ownerUsername }) {
    const userCheck = await db.query(`
                SELECT username
                FROM users
                WHERE username = $1`,
      [ownerUsername]);

    const user = userCheck.rows[0];

    if (!user) throw new NotFoundError(`User does exist: ${ownerUsername}`);

    const result = await db.query(`
          INSERT INTO listings (title,
                                type,
                                photo_url,
                                price,
                                description,
                                location,
                                owner_username)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id,
                      title,
                      type,
                      photo_url AS "photoUrl",
                      price,
                      description,
                      location,
                      owner_username AS "ownerUsername"`,
      [title, type, photoUrl, price, description, location, ownerUsername]);

    const listing = result.rows[0];

    return new Listing(listing);
  }



  /** Create WHERE clause for filters, to be used by functions that query
   * with filters.
   *
   * searchFilters (all optional):
   * - TODO: price, location, etc....
   * - title (will find case-insensitive, partial matches)
   *
   * Returns {
   *  where: "WHEREtitle ILIKE $1",
   *  vals: ['%Beach%']
   * }
   */


  static _filterWhereBuilder({ title }) {
    const whereParts = [];
    const values = [];

    if (title !== undefined) {
      values.push(`%${title}%`);
      whereParts.push(`title ILIKE $${values.length}`);
    }

    const where = (whereParts.length > 0)
      ? "WHERE " + whereParts.join(" AND ")
      : "";

    return { where, values };
  }



  /** Get a list of all listings
   *
   *  Returns [{ id, title, type, photoUrl, price,
   *  description, location, ownerUsername }, ...]
  */
  static async findAll({ title }) {

    const { where, values } = this._filterWhereBuilder({ title });

    const result = await db.query(`
        SELECT id,
            title,
            type,
            photo_url AS "photoUrl",
            price,
            description,
            location,
            owner_username AS "ownerUsername
        FROM listings
        ${where}
        ORDER BY title`, values);

    return result.rows.map(listing => new Listing(listing));
  }



  /** Given a listing id, return data about the listing.
   *
   * Returns { id, title, type, photoUrl, price,
   *  description, location, ownerUsername }
   *
   * Throws not found error if no such listing
   */
  static async get(id) {
    const listingRes = db.query(`
        SELECT id,
               title,
               type,
               photo_url AS "photoUrl",
               price,
               description,
               location,
               owner_username AS "ownerUsername"
        FROM listings
        WHERE id = $1`, [id]);

    const listing = listingRes.rows[0];

    if (!listing) throw new NotFoundError(`No listing: ${id}`);

    return new Listing(listing);
  }



  /** Update listing with data
   *
   *  Returns { id, title, type, photoUrl, price,
   *  description, location, ownerUsername }
   */
  async save() {
    const result = db.query(`
      UPDATE listings
      SET title = $1,
          type = $2,
          photo_url = $3,
          price = $4,
          description = $5,
          location = $6
      WHERE id = $7
      RETURNING id,
          title,
          type,
          photo_url AS "photoUrl",
          price,
          description,
          location,
          owner_username AS "ownerUsername"`,
      [this.title, this.type, this.photoUrl, this.price,
      this.description, this.location, this.id]);

    const listing = result.rows[0];

    if (!listing) throw new NotFoundError(`No listing: ${this.id}`);

    return new Listing(listing);
  }


  /** Delete listing; returns undefined */
  async delete() {
    const result = await db.query(`
        DELETE
        FROM listings
        WHERE id = $1
        RETURNING id`, [this.id],
    );
    const listing = result.rows[0];

    if (!listing) throw new NotFoundError(`No listing: ${this.id}`);
  }
}


export { Listing };
