/**
 * @file tests/services/jwtService.test.js
 * @description Tests for the JWT service functions.
 */

const {
  generateToken,
  decodeToken,
  verifyToken,
} = require("../../src/services/jwtService");
const jwt = require("jsonwebtoken");

describe("generateToken", () => {
  const payload = { id: 1, username: "testuser" };
  const secret = "testsecret";
  const expiresIn = "1h";

  test("should generate a valid JWT", () => {
    const token = generateToken(payload, secret, expiresIn);
    const decoded = jwt.verify(token, secret);
    expect(decoded).toMatchObject(payload);
  });

  test("should throw an error if secret is invalid", () => {
    const token = generateToken(payload, secret, expiresIn);
    expect(() => jwt.verify(token, "invalidsecret")).toThrow();
  });

  test("should include the expiration time in the JWT", () => {
    const token = generateToken(payload, secret, expiresIn);
    const decoded = jwt.verify(token, secret);
    expect(decoded.exp).toBeDefined();
  });

  test("should generate a different token for different payloads", () => {
    const payload2 = { id: 2, username: "anotheruser" };
    const token1 = generateToken(payload, secret, expiresIn);
    const token2 = generateToken(payload2, secret, expiresIn);
    expect(token1).not.toBe(token2);
  });
});

describe("decodeToken", () => {
  const payload = { id: 1, username: "testuser" };
  const secret = "testsecret";
  const expiresIn = "1h";

  test("should decode a valid JWT", () => {
    const token = generateToken(payload, secret, expiresIn);
    const decoded = decodeToken(token);
    expect(decoded).toMatchObject(payload);
  });

  test("should return null for an invalid JWT", () => {
    const invalidToken = "invalidtoken";
    const decoded = decodeToken(invalidToken);
    expect(decoded).toBeNull();
  });

  test("should decode a JWT without verifying the signature", () => {
    const token = generateToken(payload, secret, expiresIn);
    const decoded = decodeToken(token);
    expect(decoded).toHaveProperty("id", payload.id);
    expect(decoded).toHaveProperty("username", payload.username);
  });
});

describe("verifyToken", () => {
  const payload = { id: 1, username: "testuser" };
  const secret = "testsecret";
  const expiresIn = "1h";

  test("should verify a valid JWT", () => {
    const token = generateToken(payload, secret, expiresIn);
    const verified = verifyToken(token, secret);
    expect(verified).toMatchObject(payload);
  });

  test("should throw an error for an invalid JWT", () => {
    const invalidToken = "invalidtoken";
    expect(() => verifyToken(invalidToken, secret)).toThrow();
  });

  test("should throw an error if secret is invalid", () => {
    const token = generateToken(payload, secret, expiresIn);
    expect(() => verifyToken(token, "invalidsecret")).toThrow();
  });

  test("should include the expiration time in the verified payload", () => {
    const token = generateToken(payload, secret, expiresIn);
    const verified = verifyToken(token, secret);
    expect(verified.exp).toBeDefined();
  });
});
