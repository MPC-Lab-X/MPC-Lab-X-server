/**
 * @file tests/controllers/authController.test.js
 * @description Tests for the auth controller.
 */

const request = require("supertest");
const app = require("../../server");
const userService = require("../../src/services/userService");
const emailService = require("../../src/services/emailService");
const jwtService = require("../../src/services/jwtService");
const validationUtils = require("../../src/utils/validationUtils");

jest.mock("../../src/services/userService");
jest.mock("../../src/services/emailService");
jest.mock("../../src/services/jwtService");
jest.mock("../../src/utils/validationUtils");

describe("AuthController - registerUser", () => {
  it("should return 400 if email is invalid", async () => {
    validationUtils.validateEmail.mockReturnValue(false);

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "invalid-email", callbackUrl: "http://example.com" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid email address.");
    expect(res.body.error.code).toBe("INVALID_EMAIL");
  });

  it("should return 200 and send verification email if email is valid", async () => {
    validationUtils.validateEmail.mockReturnValue(true);
    jwtService.generateToken.mockReturnValue("mockToken");
    emailService.sendEmailVerification.mockResolvedValue();

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", callbackUrl: "http://example.com" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Verification email sent.");
  });

  it("should return 500 if there is an error sending the verification email", async () => {
    validationUtils.validateEmail.mockReturnValue(true);
    jwtService.generateToken.mockReturnValue("mockToken");
    emailService.sendEmailVerification.mockRejectedValue(
      new Error("Email service error")
    );

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", callbackUrl: "http://example.com" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error sending verification email.");
    expect(res.body.error.code).toBe("SEND_EMAIL_ERROR");
  });
});

describe("AuthController - completeRegistration", () => {
  it("should return 400 if token is invalid", async () => {
    jwtService.verifyToken.mockImplementation(() => {
      const error = new Error("Invalid token");
      error.name = "JsonWebTokenError";
      throw error;
    });

    const res = await request(app)
      .post("/api/auth/complete-registration")
      .send({
        token: "invalid-token",
        username: "testuser",
        password: "Password123!",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid token.");
    expect(res.body.error.code).toBe("INVALID_TOKEN");
  });

  it("should return 401 if token is expired", async () => {
    jwtService.verifyToken.mockImplementation(() => {
      const error = new Error("TokenExpiredError");
      error.name = "TokenExpiredError";
      throw error;
    });

    const res = await request(app)
      .post("/api/auth/complete-registration")
      .send({
        token: "expired-token",
        username: "testuser",
        password: "Password123!",
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Token expired.");
    expect(res.body.error.code).toBe("TOKEN_EXPIRED");
  });

  it("should return 400 if username is invalid", async () => {
    jwtService.verifyToken.mockReturnValue({ email: "test@example.com" });
    validationUtils.validateUsername.mockReturnValue(false);

    const res = await request(app)
      .post("/api/auth/complete-registration")
      .send({
        token: "valid-token",
        username: "invalid-username",
        password: "Password123!",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid username.");
    expect(res.body.error.code).toBe("INVALID_USERNAME");
  });

  it("should return 400 if password is invalid", async () => {
    jwtService.verifyToken.mockReturnValue({ email: "test@example.com" });
    validationUtils.validateUsername.mockReturnValue(true);
    validationUtils.validatePassword.mockReturnValue(false);

    const res = await request(app)
      .post("/api/auth/complete-registration")
      .send({
        token: "valid-token",
        username: "testuser",
        password: "invalid-password",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid password.");
    expect(res.body.error.code).toBe("INVALID_PASSWORD");
  });

  it("should return 400 if email is already in use", async () => {
    jwtService.verifyToken.mockReturnValue({ email: "test@example.com" });
    validationUtils.validateUsername.mockReturnValue(true);
    validationUtils.validatePassword.mockReturnValue(true);
    userService.getUserByEmail.mockResolvedValue({ email: "test@example.com" });

    const res = await request(app)
      .post("/api/auth/complete-registration")
      .send({
        token: "valid-token",
        username: "testuser",
        password: "Password123!",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email already in use.");
    expect(res.body.error.code).toBe("EMAIL_IN_USE");
  });

  it("should return 400 if username is already in use", async () => {
    jwtService.verifyToken.mockReturnValue({ email: "test@example.com" });
    validationUtils.validateUsername.mockReturnValue(true);
    validationUtils.validatePassword.mockReturnValue(true);
    userService.getUserByEmail.mockResolvedValue(null);
    userService.getUserByUsername.mockResolvedValue({ username: "testuser" });

    const res = await request(app)
      .post("/api/auth/complete-registration")
      .send({
        token: "valid-token",
        username: "testuser",
        password: "Password123!",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Username already in use.");
    expect(res.body.error.code).toBe("USERNAME_IN_USE");
  });

  it("should return 200 and create user if all inputs are valid", async () => {
    jwtService.verifyToken.mockReturnValue({ email: "test@example.com" });
    validationUtils.validateUsername.mockReturnValue(true);
    validationUtils.validatePassword.mockReturnValue(true);
    userService.getUserByEmail.mockResolvedValue(null);
    userService.getUserByUsername.mockResolvedValue(null);
    userService.createUser.mockResolvedValue({
      _id: "userId",
      email: "test@example.com",
      username: "testuser",
    });

    const res = await request(app)
      .post("/api/auth/complete-registration")
      .send({
        token: "valid-token",
        username: "testuser",
        password: "Password123!",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User created successfully.");
    expect(res.body.data).toEqual({
      _id: "userId",
      email: "test@example.com",
      username: "testuser",
    });
  });

  it("should return 500 if there is an error creating the user", async () => {
    jwtService.verifyToken.mockReturnValue({ email: "test@example.com" });
    validationUtils.validateUsername.mockReturnValue(true);
    validationUtils.validatePassword.mockReturnValue(true);
    userService.getUserByEmail.mockResolvedValue(null);
    userService.getUserByUsername.mockResolvedValue(null);
    userService.createUser.mockRejectedValue(new Error("Create user error"));

    const res = await request(app)
      .post("/api/auth/complete-registration")
      .send({
        token: "valid-token",
        username: "testuser",
        password: "Password123!",
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error creating user.");
    expect(res.body.error.code).toBe("CREATE_USER_ERROR");
  });
});

describe("AuthController - loginUser", () => {
  it("should return 400 if identifier is invalid", async () => {
    validationUtils.validateIdentifier.mockReturnValue(false);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "invalid-identifier", password: "Password123!" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid email or username.");
    expect(res.body.error.code).toBe("INVALID_IDENTIFIER");
  });

  it("should return 400 if password is invalid", async () => {
    validationUtils.validateIdentifier.mockReturnValue(true);
    validationUtils.validatePassword.mockReturnValue(false);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "test@example.com", password: "invalid-password" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid password.");
    expect(res.body.error.code).toBe("INVALID_PASSWORD");
  });

  it("should return 404 if user is not found", async () => {
    validationUtils.validateIdentifier.mockReturnValue(true);
    validationUtils.validatePassword.mockReturnValue(true);
    userService.loginUser.mockRejectedValue(new Error("User not found"));

    const res = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "test@example.com", password: "Password123!" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found.");
    expect(res.body.error.code).toBe("USER_NOT_FOUND");
  });

  it("should return 401 if password is invalid", async () => {
    validationUtils.validateIdentifier.mockReturnValue(true);
    validationUtils.validatePassword.mockReturnValue(true);
    userService.loginUser.mockRejectedValue({
      message: "Invalid password",
      user: { _id: "userId" },
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "test@example.com", password: "InvalidPassword" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid password.");
    expect(res.body.error.code).toBe("INVALID_PASSWORD");
  });

  it("should return 403 if account is locked", async () => {
    validationUtils.validateIdentifier.mockReturnValue(true);
    validationUtils.validatePassword.mockReturnValue(true);
    userService.loginUser.mockRejectedValue(new Error("Account locked"));

    const res = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "test@example.com", password: "Password123!" });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Account locked.");
    expect(res.body.error.code).toBe("ACCOUNT_LOCKED");
  });

  it("should return 200 and login user if credentials are valid", async () => {
    validationUtils.validateIdentifier.mockReturnValue(true);
    validationUtils.validatePassword.mockReturnValue(true);
    userService.loginUser.mockResolvedValue({
      _id: "userId",
      email: "test@example.com",
      username: "testuser",
    });
    userService.getRefreshTokenSecret.mockResolvedValue("refreshTokenSecret");
    jwtService.generateToken.mockImplementation(
      (payload, secret, expiresIn) => `${payload.userId}-${expiresIn}`
    );

    const res = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "test@example.com", password: "Password123!" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User logged in successfully.");
    expect(res.body.data).toEqual({
      user: { _id: "userId", email: "test@example.com", username: "testuser" },
      refreshToken: "userId-30d",
      accessToken: "userId-15m",
    });
  });

  it("should return 500 if there is an error logging in user", async () => {
    validationUtils.validateIdentifier.mockReturnValue(true);
    validationUtils.validatePassword.mockReturnValue(true);
    userService.loginUser.mockRejectedValue(new Error("Login error"));

    const res = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "test@example.com", password: "Password123!" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error logging in user.");
    expect(res.body.error.code).toBe("LOGIN_USER_ERROR");
  });
});

describe("AuthController - refreshToken", () => {
  it("should return 400 if refresh token is not provided", async () => {
    const res = await request(app).post("/api/auth/refresh-token").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid refresh token.");
    expect(res.body.error.code).toBe("INVALID_REFRESH_TOKEN");
  });

  it("should return 400 if refresh token is invalid", async () => {
    jwtService.decodeToken.mockImplementation(() => {
      const error = new Error("Invalid token");
      error.name = "JsonWebTokenError";
      throw error;
    });

    const res = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken: "invalid-token" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid token.");
    expect(res.body.error.code).toBe("INVALID_TOKEN");
  });

  it("should return 401 if refresh token is expired", async () => {
    jwtService.decodeToken.mockReturnValue({ userId: "userId" });
    jwtService.verifyToken.mockImplementation(() => {
      const error = new Error("TokenExpiredError");
      error.name = "TokenExpiredError";
      throw error;
    });

    const res = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken: "expired-token" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Token expired.");
    expect(res.body.error.code).toBe("TOKEN_EXPIRED");
  });

  it("should return 200 and refresh access token if refresh token is valid", async () => {
    jwtService.decodeToken.mockReturnValue({ userId: "userId" });
    jwtService.verifyToken.mockReturnValue({});
    userService.getRefreshTokenSecret.mockResolvedValue("refreshTokenSecret");
    jwtService.generateToken.mockImplementation(
      (payload, secret, expiresIn) => `${payload.userId}-${expiresIn}`
    );

    const res = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken: "valid-refresh-token" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Access token refreshed successfully.");
    expect(res.body.data).toEqual({ accessToken: "userId-15m" });
  });

  it("should return 500 if there is an error refreshing the token", async () => {
    jwtService.decodeToken.mockReturnValue({ userId: "userId" });
    jwtService.verifyToken.mockImplementation(() => {
      throw new Error("Some error");
    });

    const res = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken: "valid-refresh-token" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error refreshing token.");
    expect(res.body.error.code).toBe("REFRESH_TOKEN_ERROR");
  });
});

describe("AuthController - resetPassword", () => {
  it("should return 400 if email is invalid", async () => {
    validationUtils.validateEmail.mockReturnValue(false);

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ email: "invalid-email", callbackUrl: "http://example.com" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid email address.");
    expect(res.body.error.code).toBe("INVALID_EMAIL");
  });

  it("should return 404 if user is not found", async () => {
    validationUtils.validateEmail.mockReturnValue(true);
    userService.getUserByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ email: "test@example.com", callbackUrl: "http://example.com" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found.");
    expect(res.body.error.code).toBe("USER_NOT_FOUND");
  });

  it("should return 200 and send password reset email if email is valid", async () => {
    validationUtils.validateEmail.mockReturnValue(true);
    userService.getUserByEmail.mockResolvedValue({
      _id: "userId",
      email: "test@example.com",
    });
    jwtService.generateToken.mockReturnValue("mockToken");
    emailService.sendEmailVerification.mockResolvedValue();

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ email: "test@example.com", callbackUrl: "http://example.com" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Password reset email sent.");
  });

  it("should return 500 if there is an error sending the password reset email", async () => {
    validationUtils.validateEmail.mockReturnValue(true);
    userService.getUserByEmail.mockResolvedValue({
      _id: "userId",
      email: "test@example.com",
    });
    jwtService.generateToken.mockReturnValue("mockToken");
    emailService.sendEmailVerification.mockRejectedValue(
      new Error("Email service error")
    );

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ email: "test@example.com", callbackUrl: "http://example.com" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error sending password reset email.");
    expect(res.body.error.code).toBe("SEND_EMAIL_ERROR");
  });
});

describe("AuthController - completeResetPassword", () => {
  it("should return 400 if token is invalid", async () => {
    jwtService.verifyToken.mockImplementation(() => {
      const error = new Error("Invalid token");
      error.name = "JsonWebTokenError";
      throw error;
    });

    const res = await request(app)
      .post("/api/auth/complete-reset-password")
      .send({ token: "invalid-token", password: "Password123!" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid token.");
    expect(res.body.error.code).toBe("INVALID_TOKEN");
  });

  it("should return 401 if token is expired", async () => {
    jwtService.verifyToken.mockImplementation(() => {
      const error = new Error("TokenExpiredError");
      error.name = "TokenExpiredError";
      throw error;
    });

    const res = await request(app)
      .post("/api/auth/complete-reset-password")
      .send({ token: "expired-token", password: "Password123!" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Token expired.");
    expect(res.body.error.code).toBe("TOKEN_EXPIRED");
  });

  it("should return 400 if password is invalid", async () => {
    jwtService.verifyToken.mockReturnValue({ email: "test@example.com" });
    validationUtils.validatePassword.mockReturnValue(false);

    const res = await request(app)
      .post("/api/auth/complete-reset-password")
      .send({ token: "valid-token", password: "invalid-password" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid password.");
    expect(res.body.error.code).toBe("INVALID_PASSWORD");
  });

  it("should return 404 if user is not found", async () => {
    jwtService.verifyToken.mockReturnValue({ email: "test@example.com" });
    validationUtils.validatePassword.mockReturnValue(true);
    userService.getUserByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/complete-reset-password")
      .send({ token: "valid-token", password: "Password123!" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found.");
    expect(res.body.error.code).toBe("USER_NOT_FOUND");
  });

  it("should return 200 and reset password if all inputs are valid", async () => {
    jwtService.verifyToken.mockReturnValue({ email: "test@example.com" });
    validationUtils.validatePassword.mockReturnValue(true);
    userService.getUserByEmail.mockResolvedValue({
      _id: "userId",
      email: "test@example.com",
    });
    userService.updateUserById.mockResolvedValue({
      _id: "userId",
      email: "test@example.com",
    });

    const res = await request(app)
      .post("/api/auth/complete-reset-password")
      .send({ token: "valid-token", password: "Password123!" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Password reset successfully.");
    expect(res.body.data).toEqual({ _id: "userId", email: "test@example.com" });
  });

  it("should return 500 if there is an error resetting the password", async () => {
    jwtService.verifyToken.mockReturnValue({ email: "test@example.com" });
    validationUtils.validatePassword.mockReturnValue(true);
    userService.getUserByEmail.mockResolvedValue({
      _id: "userId",
      email: "test@example.com",
    });
    userService.updateUserById.mockRejectedValue(
      new Error("Reset password error")
    );

    const res = await request(app)
      .post("/api/auth/complete-reset-password")
      .send({ token: "valid-token", password: "Password123!" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error resetting password.");
    expect(res.body.error.code).toBe("RESET_PASSWORD_ERROR");
  });
});
