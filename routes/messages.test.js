"use strict";

const request = require("supertest");
const app = require("../app");

const {
  u1Token,
  u3Token,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testMessageIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("POST /messages", function () {
  test("works with logged in user and valid data", async function () {
    const resp = await request(app)
      .post("/messages")
      .set('authorization', `Bearer ${u1Token}`)
      .send({ recipient: "u2", body: "test message" });

    expect(resp.body).toEqual({
      message: {
        id: expect.any(Number),
        sender: "u1",
        recipient: "u2",
        body: "test message",
        sentAt: expect.any(String)
      }
    });
  });

  test("unauth with anon", async function () {
    const resp = await request(app)
      .post("/messages")
      .send({ recipient: "u2", body: "this wont work" });

    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/messages")
      .set('authorization', `Bearer ${u1Token}`)
      .send({
        transferMoney: 100000, sendTo: "me"
      });

    expect(resp.statusCode).toEqual(400);
  });
});

describe("GET /messages/:id", function () {
  test("works with logged in user and valid id", async function () {
    const resp = await request(app)
      .get(`/messages/${testMessageIds[0]}`)
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.body).toEqual({
      message: {
        id: testMessageIds[0],
        sender: "u1",
        recipient: "u2",
        body: "hello",
        sentAt: expect.any(String)
      }
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .get(`/messages/${testMessageIds[0]}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("unauth if not sender or recipient", async function () {
    const resp = await request(app)
      .get(`/messages/${testMessageIds[0]}`)
      .set("authorization", `Bearer ${u3Token}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("not found if invalid message ID", async function () {
    const resp = await request(app)
      .get("/messages/-1")
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(404);
  });
});
