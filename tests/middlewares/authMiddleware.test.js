/**
 * @file tests/middlewares/authMiddleware.test.js
 * @description Tests for the auth middleware function.
 */

const authMiddleware = require("../../src/middlewares/authMiddleware");
const jwtService = require("../../src/services/jwtService");

jest.mock("../../src/services/jwtService");

describe("authMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      path: "",
      headers: {},
    };
    res = {
      unauthorized: jest.fn(),
      badRequest: jest.fn(),
      internalServerError: jest.fn(),
    };
    next = jest.fn();
  });

  it("should call next if the route is public", () => {
    req.path = "/api/auth/login";
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should return unauthorized if no token is provided", () => {
    req.path = "/api/protected";
    authMiddleware(req, res, next);
    expect(res.unauthorized).toHaveBeenCalledWith(
      "No token provided.",
      "NO_TOKEN"
    );
  });

  it("should set req.user and call next if token is valid", () => {
    req.path = "/api/protected";
    req.headers["authorization"] = "valid-token";
    const payload = { id: 1, name: "Test User" };
    jwtService.verifyToken.mockReturnValue(payload);

    authMiddleware(req, res, next);

    expect(jwtService.verifyToken).toHaveBeenCalledWith(
      "valid-token",
      process.env.JWT_SECRET
    );
    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalled();
  });

  it("should return unauthorized if token is expired", () => {
    req.path = "/api/protected";
    req.headers["authorization"] = "expired-token";
    const error = new Error("Token expired");
    error.name = "TokenExpiredError";
    jwtService.verifyToken.mockImplementation(() => {
      throw error;
    });

    authMiddleware(req, res, next);

    expect(res.unauthorized).toHaveBeenCalledWith(
      "Token expired.",
      "TOKEN_EXPIRED"
    );
  });

  it("should return unauthorized if token is invalid", () => {
    req.path = "/api/protected";
    req.headers["authorization"] = "invalid-token";
    const error = new Error("Invalid token");
    error.name = "JsonWebTokenError";
    jwtService.verifyToken.mockImplementation(() => {
      throw error;
    });

    authMiddleware(req, res, next);

    expect(res.unauthorized).toHaveBeenCalledWith(
      "Invalid token.",
      "INVALID_TOKEN"
    );
  });

  it("should return internal server error for other errors", () => {
    req.path = "/api/protected";
    req.headers["authorization"] = "some-token";
    const error = new Error("Some other error");
    jwtService.verifyToken.mockImplementation(() => {
      throw error;
    });

    authMiddleware(req, res, next);

    expect(res.internalServerError).toHaveBeenCalledWith(
      "Error verifying token.",
      "VERIFY_TOKEN_ERROR"
    );
  });
});
