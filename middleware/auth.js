/** Convenience middleware to handle common auth cases in routes. */

import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config.js";
import { UnauthorizedError } from "../expressError.js";
import Listing from "../models/listing.js";


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^[Bb]earer /, "").trim();

    try {
      res.locals.user = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      /* ignore invalid tokens (but don't store user!) */
    }
  }
  return next();

}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  if (res.locals.user?.username) return next();
  throw new UnauthorizedError();
}


/** Middleware to use when they must provide a valid token & be user matching
 *  username provided as route param.
 *
 *  If not, raises Unauthorized.
 */

function ensureCorrectUser(req, res, next) {
  const username = res.locals.user?.username;
  if (username && username === req.params.username) {
    return next();
  }

  throw new UnauthorizedError();
}

async function ensureCorrectOwner(req, res, next) {
  const listingId = req.params.id;
  const username = res.locals.user?.username;

  const listing = await Listing.get(listingId);

  if (listing.ownerUsername === username) {
    return next();
  }

  throw new UnauthorizedError(`You are not the owner of this property.`);
}



export { authenticateJWT, ensureLoggedIn, ensureCorrectUser, ensureCorrectOwner };
