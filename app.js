"use strict";

/** Express app for ShareBnB */

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.js");
const usersRoutes = require("./routes/users.js");
const listingsRoutes = require("./routes/listings.js");
const messagesRoutes = require("./routes/messages.js");
const { NotFoundError } = require("./expressError.js");
const { authenticateJWT } = require("./middleware/auth.js");

const app = express();

app.use(express.json());
app.use(cors());
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/listings", listingsRoutes);
app.use("/messages", messagesRoutes);

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  throw new NotFoundError();
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  /* istanbul ignore next (ignore for coverage) */
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports =  app;
