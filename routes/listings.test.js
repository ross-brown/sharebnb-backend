"use strict";

const request = require("supertest");
const app = require("../app");
const { uploadS3 } = require("../helpers/s3upload");

const {
  u1Token,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testListingIds,
  u2Token
} = require("./_testCommon");

jest.mock("../helpers/s3upload.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("POST /listings", function () {
  const listingData = {
    title: "test listing",
    type: "test",
    price: 100,
    description: "test test test",
    location: "here",
  };

  uploadS3.mockImplementation(async () => "test/123-photo");

  test("works if logged in with valid data", async function () {
    const resp = await request(app)
      .post("/listings")
      .set("authorization", `Bearer ${u1Token}`)
      .field("title", listingData.title)
      .field("type", listingData.type)
      .field("price", listingData.price)
      .field("description", listingData.description)
      .field("location", listingData.location)
      .attach("photo", "public/images/sharebnb-test-photo.jpg");

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      listing: {
        ...listingData,
        id: expect.any(Number),
        photoUrl: "test/123-photo",
        ownerUsername: "u1"
      }
    });
  });

  test("unauth if anon", async function () {
    const resp = await request(app)
      .post("/listings")
      .field("title", listingData.title)
      .field("type", listingData.type)
      .field("price", listingData.price)
      .field("description", listingData.description)
      .field("location", listingData.location)
      .attach("photo", "public/images/sharebnb-test-photo.jpg");

    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with no photo", async function () {
    const resp = await request(app)
      .post("/listings")
      .set("authorization", `Bearer ${u1Token}`)
      .send(listingData);

    expect(resp.statusCode).toEqual(400);
  });
});

describe("GET /listings", function () {
  test("works with no filters", async function () {
    const resp = await request(app)
      .get("/listings");

    expect(resp.body).toEqual({
      listings: [
        {
          id: expect.any(Number),
          title: "l1",
          type: "yard",
          photoUrl: null,
          price: 100,
          description: "very cool",
          location: "Austin",
          ownerUsername: "u1"
        },
        {
          id: expect.any(Number),
          title: "l2",
          type: "treehouse",
          photoUrl: null,
          price: 100,
          description: "very tall",
          location: "Dallas",
          ownerUsername: "u2"
        },
        {
          id: expect.any(Number),
          title: "l3",
          type: "pool",
          photoUrl: null,
          price: 100,
          description: "very nice",
          location: "NYC",
          ownerUsername: "u3"
        },
      ]
    });
  });

  test("works with filters", async function () {
    const resp = await request(app)
      .get("/listings")
      .query({ title: "l2" });

    expect(resp.body).toEqual({
      listings: [
        {
          id: expect.any(Number),
          title: "l2",
          type: "treehouse",
          photoUrl: null,
          price: 100,
          description: "very tall",
          location: "Dallas",
          ownerUsername: "u2"
        }
      ]
    });
  });

  test("bad request with invalid filter", async function () {
    const resp = await request(app)
      .get("/listings")
      .query({ nope: "not allowed" });

    expect(resp.statusCode).toEqual(400);
  });
});

describe("GET /listings/:id", function () {
  test("works", async function () {
    const resp = await request(app)
      .get(`/listings/${testListingIds[0]}`);

    expect(resp.body).toEqual({
      listing: {
        id: expect.any(Number),
        title: "l1",
        type: "yard",
        photoUrl: null,
        price: 100,
        description: "very cool",
        location: "Austin",
        ownerUsername: "u1"
      },
    });
  });

  test("not found if invalid ID", async function () {
    const resp = await request(app)
      .get(`/listings/-1`);

    expect(resp.statusCode).toEqual(404);
  });
});

describe("POST /listings/:id/book", function () {
  test("works while logged in with valid listing", async function () {
    const resp = await request(app)
      .post(`/listings/${testListingIds[2]}/book`)
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.body).toEqual({
      booking: {
        username: "u1",
        listingId: testListingIds[2]
      }
    });
  });

  test("bad request if booking own listing", async function () {
    const resp = await request(app)
      .post(`/listings/${testListingIds[0]}/book`)
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if already booked", async function () {
    const resp = await request(app)
      .post(`/listings/${testListingIds[1]}/book`)
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(400);
  });

  test("unauth if anon", async function () {
    const resp = await request(app)
      .post(`/listings/${testListingIds[2]}/book`);

    expect(resp.statusCode).toEqual(401);
  });

  test("not found if invalid listing ID", async function () {
    const resp = await request(app)
      .post("/listings/-1/book")
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(404);
  });
});

describe("DELETE /listings/:id/book", function () {
  test("works logged in and valid listing/booking", async function () {
    const resp = await request(app)
      .delete(`/listings/${testListingIds[1]}/book`)
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.body).toEqual({ cancelled: testListingIds[1].toString() });
  });

  test("unauth if anon", async function () {
    const resp = await request(app)
      .delete(`/listings/${testListingIds[0]}/book`);

    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user hasn't booked the listing", async function () {
    const resp = await request(app)
      .delete(`/listings/${testListingIds[2]}/book`)
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(404);
  });
});

describe("PATCH /listings/:id", function () {
  test("works with correct owver, data, and listing", async function () {
    const resp = await request(app)
      .patch(`/listings/${testListingIds[0]}`)
      .set("authorization", `${u1Token}`)
      .send({ title: "new title", price: 1000 });

    expect(resp.body).toEqual({
      listing: {
        id: testListingIds[0],
        title: "new title",
        type: "yard",
        photoUrl: null,
        price: 1000,
        description: "very cool",
        location: "Austin",
        ownerUsername: "u1"
      }
    });
  });

  test("unauth if anon", async function () {
    const resp = await request(app)
      .patch(`/listings/${testListingIds[0]}`)
      .send({ title: "not gonna work" });

    expect(resp.statusCode).toEqual(401);
  });

  test("unauth if not owner", async function () {
    const resp = await request(app)
      .patch(`/listings/${testListingIds[0]}`)
      .set("authorzation", `Bearer ${u2Token}`)
      .send({ title: "not gonna work" });

    expect(resp.statusCode).toEqual(401);
  });

  test("not found if invalid listing ID", async function () {
    const resp = await request(app)
      .patch(`/listings/-1`)
      .set("authorization", `${u1Token}`)
      .send({ title: "new title", price: 1000 });

    expect(resp.statusCode).toEqual(404);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .patch(`/listings/${testListingIds[0]}`)
      .set("authorization", `${u1Token}`)
      .send({ newOwner: "ME", price: false });

    expect(resp.statusCode).toEqual(400);
  });
});

describe("DELETE /listings/:id", function () {
  test("works with correct owner and listing", async function () {
    const resp = await request(app)
      .delete(`/listings/${testListingIds[0]}`)
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.body).toEqual({ deleted: testListingIds[0].toString() });
  });

  test("unauth if anon", async function () {
    const resp = await request(app)
      .delete(`/listings/${testListingIds[0]}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("unauth is not owner", async function () {
    const resp = await request(app)
      .delete(`/listings/${testListingIds[1]}`)
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("not found if invalid listing ID", async function () {
    const resp = await request(app)
      .delete("/listings/-1")
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(404);
  });
});
