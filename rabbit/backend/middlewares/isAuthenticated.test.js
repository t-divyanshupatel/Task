import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import isAuthenticated from "./isAuthenticated.js";

const SECRET = "test-secret-key";
process.env.SECRET_KEY = SECRET;

function createMocks(token) {
  const req = { cookies: {} };
  if (token !== undefined) {
    req.cookies.token = token;
  }

  let statusCode;
  let jsonBody;
  let nextCalled = false;

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(body) {
      jsonBody = body;
      return res;
    },
  };

  const next = () => {
    nextCalled = true;
  };

  return {
    req,
    res,
    next,
    getStatus: () => statusCode,
    getBody: () => jsonBody,
    wasNextCalled: () => nextCalled,
  };
}

test("returns 401 when token cookie is missing", async () => {
  const { req, res, next, getStatus, getBody } = createMocks();
  await isAuthenticated(req, res, next);

  assert.equal(getStatus(), 401);
  assert.equal(getBody().success, false);
  assert.equal(getBody().message, "User not authenticated");
});

test("returns 401 when token is invalid", async () => {
  const { req, res, next, getStatus, getBody } = createMocks("not-a-valid-jwt");
  await isAuthenticated(req, res, next);

  assert.equal(getStatus(), 401);
  assert.equal(getBody().success, false);
  assert.equal(getBody().message, "Invalid token");
});

test("calls next and sets req.id when token is valid", async () => {
  const userId = "507f1f77bcf86cd799439011";
  const token = jwt.sign({ userId }, SECRET, { expiresIn: "1h" });
  const { req, res, next, wasNextCalled } = createMocks(token);

  await isAuthenticated(req, res, next);

  assert.ok(wasNextCalled());
  assert.equal(req.id, userId);
});
