"use strict";

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testMessageIds
} = require("./_testCommon");
const Message = require("./message");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create", function () {
  test("works", async function () {
    const newMessage = {
      sender: "u3",
      recipient: "u1",
      body: "test message."
    };

    const message = await Message.create(newMessage);

    expect(message).toEqual({
      ...newMessage,
      id: expect.any(Number),
      sentAt: expect.any(Date)
    });

    const found = await db.query("SELECT * FROM messages WHERE body = 'test message.'");
    expect(found.rows.length).toEqual(1);
  });

  test("bad request with invalid recipient", async function () {
    try {
      const invalidMessage = {
        sender: "u3",
        recipient: "nope",
        body: "bad message."
      };
      await Message.create(invalidMessage);
      throw new Error("This shouldn't have happened, test failed");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("get", function () {
  test("works", async function () {
    const message = await Message.get(testMessageIds[0]);

    expect(message).toEqual({
      id: testMessageIds[0],
      sender: "u2",
      recipient: "u1",
      body: "hello",
      sentAt: expect.any(Date)
    });
  });

  test("not found on invalid message", async function () {
    try {
      await Message.get(-1);
      throw new Error("This shouldn't have happened, test failed");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
