/** Routes for Listings */

import express from "express";
import Listing from "../models/listing.js";
import jsonschema from "jsonschema";
import { upload } from "../middleware/multer.js";
import { uploadS3 } from "../helpers/s3upload.js";

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
//validate form data, upload photo to s3, in db store photoURL and formdata, return listing
router.post("/", upload.single("photo"), async function (req, res, next) {
  //jsonschema

  const imgUrl = await uploadS3(req.file)


  const { username } = res.locals.user;
  const listingData = req.body;
  listingData.ownerUsername = username;
  listingData.photoUrl = imgUrl;

  const listing = await Listing.create(listingData);
  return res.status(201).json({ listing });
});

export default router;