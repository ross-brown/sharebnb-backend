"use strict";

const db = require("../db");
const User = require("./user");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError
} = require("../expressError");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testListingIds,
  testBookingIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("authenticate", function () {
  test("works", async function () {
    const user = await User.authenticate("u1", "password1");
    expect(user).toEqual({
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "u1@email.com"
    });
  });

  test("unauth if no such user", async function () {
    try {
      await User.authenticate("wrong", "incorrect");
      throw new Error("You shouldn't get here, something it wrong with auth");
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth w/ wrong password", async function () {
    try {
      await User.authenticate("u1", "WRONG");
      throw new Error("You shouldn't get here, test failed");
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});



describe("register", function () {
  const newUser = {
    username: "new",
    firstName: "Test",
    lastName: "User",
    email: "test@email.com"
  };

  test("works", async function () {
    const user = await User.register({
      ...newUser,
      password: "password"
    });
    expect(user).toEqual(newUser);
    const found = await db.query(`SELECT * FROM users WHERE username = 'new'`);
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("bad request with duplicate data", async function () {
    try {
      await User.register({
        ...newUser,
        password: "password"
      });
      await User.register({
        ...newUser,
        password: "password"
      });
      throw new Error("You shouldn't have gotten here, test failed");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

});



describe("findAll", function () {
  test("works", async function () {
    const users = await User.findAll();
    expect(users).toEqual([
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
    ]);
  });
});



describe("get", function () {
  test("works", async function () {
    const user = await User.get("u1");
    expect(user).toEqual({
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "u1@email.com",
      listings: [
        {
          id: testListingIds[0],
          title: "l1",
          price: 100,
          photoUrl: null
        }
      ],
      bookings: [
        {
          id: testBookingIds[0],
          title: "l2",
          price: 100,
          photoUrl: null,
          username: "u1"
        }
      ]
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.get("notauser");
      throw new Error("This should not have been thrown, test failed");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});



describe("save", function () {
  test("works", async function () {
    const userRes = await User.get("u1");
    userRes.firstName = "newFirstName";
    userRes.lastName = "newLastName";
    userRes.email = "new@email.com";
    const savedUser = await userRes.save();
    expect(savedUser).toEqual({
      username: "u1",
      firstName: "newFirstName",
      lastName: "newLastName",
      email: "new@email.com",
    });
  });
});



describe("delete", function () {
  test("works", async function () {
    const userRes = await User.get("u3");
    await userRes.delete();

    const check = await db.query(`SELECT username FROM users`);
    expect(check.rows.every(r => r.username !== "u3")).toBeTruthy();
  });
});
