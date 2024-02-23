"use strict";

const request = require("supertest");

const app = require("../app");
const {
  commonBeforeEach,
  commonBeforeAll,
  commonAfterEach,
  commonAfterAll,
  testListingIds,
  u1Token,
  u2Token,
  testMessageIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("GET /users", function () {
  test("works", async function () {
    const resp = await request(app)
      .get("/users");

    expect(resp.body).toEqual({
      users: [
        {
          username: "u1",
          firstName: "U1F",
          lastName: "U1L",
          email: "u1@email.com"
        },
        {
          username: "u2",
          firstName: "U2F",
          lastName: "U2L",
          email: "u2@email.com"
        },
        {
          username: "u3",
          firstName: "U3F",
          lastName: "U3L",
          email: "u3@email.com"
        },
      ]
    });
  });
});

describe("GET /users/:username", function () {
  test("works", async function () {
    const resp = await request(app)
      .get("/users/u1");

    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "u1@email.com",
        listings: [
          { id: testListingIds[0], title: "l1", price: 100, photoUrl: null }
        ],
        bookings: [
          { id: testListingIds[1], title: "l2", price: 100, photoUrl: null, username: "u1" }
        ]
      }
    });
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
      .get("/users/nope");
    expect(resp.statusCode).toEqual(404);
  });
});

describe("GET /users/:username/inbox", function () {
  test("works with correct user", async function () {
    const resp = await request(app)
      .get("/users/u1/inbox")
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.body).toEqual({
      messages: [
        {
          id: testMessageIds[1],
          sender: "u2",
          recipient: "u1",
          body: "hey",
          sentAt: expect.any(String)
        }
      ]
    });
  });

  test("unauth if wrong user", async function () {
    const resp = await request(app)
      .get("/users/u1/inbox")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth if anon", async function () {
    const resp = await request(app)
      .get("/users/u1/inbox");
    expect(resp.statusCode).toEqual(401);
  });

  test("unath if invalid username", async function () {
    const resp = await request(app)
      .get("/users/nope/inbox")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

describe("GET /users/:username/sent", function () {
  test("works with correct user", async function () {
    const resp = await request(app)
      .get("/users/u1/sent")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      messages: [
        {
          id: testMessageIds[0],
          sender: "u1",
          recipient: "u2",
          body: "hello",
          sentAt: expect.any(String)
        }
      ]
    });
  });

  test("unauth with wrong user logged in", async function () {
    const resp = await request(app)
      .get("/users/u1/sent")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth with anon", async function () {
    const resp = await request(app)
      .get("/users/u1/sent");
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth with invalid username", async function () {
    const resp = await request(app)
      .get("/users/nope/sent")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});


// works with correct request body (check for 201)
// bad request with incorrect/missing data
// bad request with duplicate username

describe("POST /users", function () {

});
