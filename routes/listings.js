/** Routes for Listings */

const express = require("express");
const Listing = require("../models/listing.js");
const jsonschema = require("jsonschema");
const lisitngSearchSchema = require("../schemata/listingSearch.json");
const listingNewSchema = require("../schemata/listingNew.json");
const listingUpdateSchema = require("../schemata/listingUpdate.json");
const { upload } = require("../middleware/multer.js");
const { deleteS3, uploadS3 } = require("../helpers/s3upload.js");
const { ensureCorrectOwner, ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth.js");
const { BadRequestError } = require("../expressError.js");

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
router.post("/", upload.single("photo"), ensureLoggedIn, async function (req, res, next) {
   req.body.price = +req.body.price;
   if (!req.file) throw new BadRequestError("Photo is required for a listing");

   const validator = jsonschema.validate(
      req.body,
      listingNewSchema,
      { required: true });

   if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
   }

   const { username } = res.locals.user;
   const listingData = req.body;
   const imgUrl = await uploadS3(req.file);

   listingData.ownerUsername = username;
   listingData.photoUrl = imgUrl;

   const listing = await Listing.create(listingData);
   return res.status(201).json({ listing });
});


/** GET /  =>
 *   { listings: [ { id, title, type, photoUrl, price,
 *     description, location, ownerUsername }, ...] }
 *
 * Can filter on provided search filters:
 * - title (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */
router.get("/", async function (req, res, next) {
   const validator = jsonschema.validate(
      req.query,
      lisitngSearchSchema,
      { required: true });

   if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
   }

   const listings = await Listing.findAll(req.query);
   return res.json({ listings });
});


/** GET /[id]  =>  { listing }
 *
 *  Listing is { id, title, type, photoUrl, description, location, ownerUsername }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
   const listing = await Listing.get(+req.params.id);
   return res.json({ listing });
});


/** POST /[id]/book => { booking }
 *
 * booking is { username, listingId }
 *
 * Authorization required: logged in user
 */

router.post("/:id/book", ensureLoggedIn, async function (req, res, next) {
   const { username } = res.locals.user;
   const listing = await Listing.get(+req.params.id);
   const booking = await listing.book(username);

   return res.json({ booking });
});


/** DELETE /[id]/book => { cancelled: [id] }
 *
 * Authorization required:
 */

router.delete("/:id/book", ensureLoggedIn, async function (req, res, next) {
   const { username } = res.locals.user;
   const listing = await Listing.get(+req.params.id);
   await listing.unbook(username);

   return res.json({ cancelled: req.params.id });
});


/** PATCH /[id] { fld1, fld2, ... } => { listing }
 *
 * Patches listing data.
 *
 * fields can be: { title, type, photo_url, price, description, location }
 *
 * Returns { id, title, type, photo_url, price,
 *  description, location, ownerUsername }
 *
 * Authorization required: Property Owner
 */

router.patch("/:id", upload.single("photo"), ensureCorrectOwner, async function (req, res, next) {
   const listingRes = await Listing.get(+req.params.id);

   const validator = jsonschema.validate(
      req.body,
      listingUpdateSchema,
      { required: true }
   );
   if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
   }

   if (req.file) {
      // If the form data includes a new photo, update that photo in s3 AND DB
      const newPhotoUrl = await uploadS3(req.file);
      await deleteS3(listingRes.photoUrl);
      listingRes.photoUrl = newPhotoUrl;
   }

   Object.keys(req.body).map(key => listingRes[key] = req.body[key]);
   const listing = await listingRes.save();

   return res.json({ listing });
});


/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: Property Owner
 */

router.delete("/:id", ensureCorrectOwner, async function (req, res, next) {
   const listing = await Listing.get(+req.params.id);
   await deleteS3(listing.photoUrl);

   await listing.delete();
   return res.json({ deleted: req.params.id });
});

module.exports = router;
