"use strict";

const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testListingIds
} = require("./_testCommon");
const Listing = require("./listing");


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create", function () {
  const newListing = {
    title: "newListing",
    type: "yard",
    photoUrl: null,
    price: 500,
    description: "test description",
    location: "somewhere",
    ownerUsername: "u1",
  };

  test("works", async function () {
    const listing = await Listing.create(newListing);
    expect(listing).toEqual({
      id: expect.any(Number),
      ...newListing
    });

    const found = await db.query(`SELECT * FROM listings WHERE title = 'newListing'`);
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].description).toEqual("test description");
  });

  test("not found if create with invalid user", async function () {
    try {
      await Listing.create({ ...newListing, ownerUsername: "invalid" });
      throw new Error("This error shouldn't happen, test failed");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("_filterWhereBuilder", function () {
  test("works", function () {
    const { where, values } = Listing._filterWhereBuilder({ title: "test" });

    expect(where).toEqual("WHERE title ILIKE $1");
    expect(values).toEqual(["%test%"]);
  });

  test("works with no arguments", function () {
    const { where, values } = Listing._filterWhereBuilder({});

    expect(where).toEqual("");
    expect(values).toEqual([]);
  });
});

describe("findAll", function () {
  test("works, no filter", async function () {
    const listings = await Listing.findAll({});

    expect(listings).toEqual([
      {
        id: testListingIds[0],
        title: "l1",
        type: "yard",
        photoUrl: null,
        price: 100,
        description: "very nice",
        location: "Austin",
        ownerUsername: "u1"
      },
      {
        id: testListingIds[1],
        title: "l2",
        type: "treehouse",
        photoUrl: null,
        price: 100,
        description: "very tall",
        location: "Dallas",
        ownerUsername: "u2"
      },
      {
        id: testListingIds[2],
        title: "l3",
        type: "pool",
        photoUrl: null,
        price: 100,
        description: "very cool",
        location: "NYC",
        ownerUsername: "u3"
      },
    ]);
  });

  test("works, with title filter", async function () {
    const listings = await Listing.findAll({ title: "l1" });

    expect(listings.length).toBe(1);
    expect(listings).toEqual([{
      id: testListingIds[0],
      title: "l1",
      type: "yard",
      photoUrl: null,
      price: 100,
      description: "very nice",
      location: "Austin",
      ownerUsername: "u1"
    },]);
  });
});

describe("get", function () {
  test("works", async function () {
    const listing = await Listing.get(testListingIds[0]);

    expect(listing).toEqual({
      id: testListingIds[0],
      title: "l1",
      type: "yard",
      photoUrl: null,
      price: 100,
      description: "very nice",
      location: "Austin",
      ownerUsername: "u1"
    });
  });

  test("not found error if invalid listing ID", async function () {
    try {
      await Listing.get(-1);
      throw new Error("This error should not have happened, test failed.");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("book", function () {
  test("works", async function () {
    const u3ListingId = testListingIds[2];
    const listing = await Listing.get(u3ListingId);
    const booking = await listing.book("u1");
    const allBookings = await db.query(`SELECT * FROM bookings`);

    expect(booking.username).toEqual("u1");
    expect(booking.listingId).toEqual(u3ListingId);
    expect(allBookings.rows.some(r => r.username === "u1" && r.listing_id === u3ListingId));
  });

  test("bad request if booking own listing", async function () {
    try {
      const u1ListingId = testListingIds[0];
      const listing = await Listing.get(u1ListingId);
      await listing.book("u1");
      throw new Error("This shouldn't have happened, test failed");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("not found if username doesn't exist", async function () {
    try {
      const u1ListingId = testListingIds[0];
      const listing = await Listing.get(u1ListingId);
      await listing.book("nope");
      throw new Error("This shouldn't have happened, test failed");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("unbook", function () {
  test("works", async function () {
    const u1ListingId = testListingIds[0];
    const listing = await Listing.get(u1ListingId);
    await listing.unbook("u2");

    const bookings = await db.query(`SELECT * FROM bookings`);
    expect(bookings.rows.length).toEqual(1);
  });

  test("not found if booking doesn't exist", async function () {
    try {
      const u3ListingId = testListingIds[2];
      const listing = await Listing.get(u3ListingId);
      await listing.unbook("u1");
      throw new Error("This shouldn't have happened, test failed");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if username doesn't exist", async function () {
    try {
      const u3ListingId = testListingIds[2];
      const listing = await Listing.get(u3ListingId);
      await listing.unbook("nope");
      throw new Error("This shouldn't have happened, test failed");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("save", function () {
  test("works", async function () {
    const listing = await Listing.get(testListingIds[0]);
    listing.price = 200;
    listing.location = "Atlanta";
    const savedListing = await listing.save();

    expect(savedListing).toEqual({
      id: testListingIds[0],
      title: "l1",
      type: "yard",
      price: 200,
      photoUrl: null,
      description: "very nice",
      location: "Atlanta",
      ownerUsername: "u1"
    });
  });
});

describe("delete", function () {
  test("works", async function () {
    const listing = await Listing.get(testListingIds[0]);
    await listing.delete();

    const listings = await db.query(`SELECT * FROM listings`);
    expect(listings.rows.every(r => r.id !== testListingIds[0])).toBeTruthy();
  });
});
