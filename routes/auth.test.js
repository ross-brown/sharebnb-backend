"use strict";

const request = require("supertest");
const app = require("../app");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("POST /auth/token", function () {
  test("works with correct credentials", async function () {
    const resp = await request(app)
      .post("/auth/token")
      .send({
        username: "u1",
        password: "password1"
      });

    expect(resp.body).toEqual({ token: expect.any(String) });
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/auth/token")
      .send({
        favoriteIceCream: "vanilla",
        isAdmin: true
      });

    expect(resp.statusCode).toEqual(400);
  });

  test("unauth with incorrect creds", async function () {
    const resp = await request(app)
      .post("/auth/token")
      .send({
        username: "wrong",
        password: "nope"
      });

    expect(resp.statusCode).toEqual(401);
  });
});

describe("POST /auth/register", function () {
  test("works with valid data", async function () {
    const resp = await request(app)
      .post("/auth/register")
      .send({
        username: "newUser",
        password: "newPassword",
        firstName: "new",
        lastName: "user",
        email: "new@email.com"
      });

    expect(resp.body).toEqual({ token: expect.any(String) });
    expect(resp.statusCode).toEqual(201);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/auth/register")
      .send({
        favoriteIceCream: "vanilla",
        isAdmin: true
      });

    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with duplicate username", async function () {
    const resp = await request(app)
      .post("/auth/register")
      .send({
        username: "u1",
        password: "newPassword",
        firstName: "new",
        lastName: "user",
        email: "new@email.com"
      });

    expect(resp.statusCode).toEqual(400);
  });
});
