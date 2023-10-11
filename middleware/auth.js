/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


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




export { authenticateJWT }
