/** Routes for Listings */

import express from "express";
import Listing from "../models/listing.js";
import jsonschema from "jsonschema";

const router = express.Router();



/** POST / { listing } =>  { listing }
 *
 * listing should be { title, type, photoUrl, price,
    description, location }
 *
 * Returns { id ,title, type, photoUrl, price,
    description, location, ownerUsername }
 *
 * Authorization required: loggedIn
 */

//TODO: here (i think) is where we need to get req.file and call the s3 function
//not sure how exactly the request will look like from a form submit here
router.post("/", async function (req, res, next) {
  //jsonschema

  const { username } = res.locals.user;
  const listingData = req.body;
  listingData.ownerUsername = username;

  const listing = await Listing.create(listingData);
  return res.status(201).json({ listing });
});
