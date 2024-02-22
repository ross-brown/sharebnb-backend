"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
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


//TODO: works / bad request if book own listing / bad requset if username not found
describe("book", function () {

});
