/**
 * @file tests/controllers/userController.test.js
 * @description Tests for the user controller functions.
 */

const request = require("supertest");
const app = require("../../server");
const { verifyPassword } = require("../../src/services/passwordHashService");
const userService = require("../../src/services/userService");
const emailService = require("../../src/services/emailService");
const jwtService = require("../../src/services/jwtService");

jest.mock("../../src/middlewares/authMiddleware", () => {
  return jest.fn((req, res, next) => {
    req.user = { userId: "userId" };
    next();
  });
});

jest.mock("../../src/services/passwordHashService", () => ({
  verifyPassword: jest.fn(),
}));

describe("UserController - getUser", () => {
  it("should return 404 if user is not found", async () => {
    userService.getUserById = jest.fn().mockResolvedValue(null);

    const res = await request(app).get("/api/users/userId");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found.");
    expect(res.body.error.code).toBe("USER_NOT_FOUND");
  });

  it("should return 200 and the user if user is found", async () => {
    const mockUser = { _id: "userId", name: "John Doe" };
    userService.getUserById = jest.fn().mockResolvedValue(mockUser);

    const res = await request(app).get("/api/users/userId");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User found successfully.");
    expect(res.body.data).toEqual(mockUser);
  });

  it("should return 500 if there is an error getting the user", async () => {
    userService.getUserById = jest.fn().mockRejectedValue(new Error("Error"));

    const res = await request(app).get("/api/users/userId");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error getting user.");
    expect(res.body.error.code).toBe("GET_USER_ERROR");
  });
});

describe("UserController - getSafetyRecords", () => {
  it("should return 403 if user is not the same as the requested user", async () => {
    const res = await request(app).get(
      "/api/users/anotherUserId/safety-records"
    );

    expect(res.status).toBe(403);
    expect(res.body.message).toBe(
      "Forbidden to get safety records for this user."
    );
    expect(res.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 400 if limit is invalid", async () => {
    const res = await request(app)
      .get("/api/users/userId/safety-records")
      .query({ limit: "invalid" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid limit.");
    expect(res.body.error.code).toBe("INVALID_LIMIT");
  });

  it("should return 400 if offset is invalid", async () => {
    const res = await request(app)
      .get("/api/users/userId/safety-records")
      .query({ offset: "invalid" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid offset.");
    expect(res.body.error.code).toBe("INVALID_OFFSET");
  });

  it("should return 200 and the safety records if user is authorized", async () => {
    const mockSafetyRecords = [{ id: "record1" }, { id: "record2" }];
    userService.getSafetyRecordsById = jest
      .fn()
      .mockResolvedValue(mockSafetyRecords);

    const res = await request(app)
      .get("/api/users/userId/safety-records")
      .query({ limit: 10, offset: 0 });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Safety records found successfully.");
    expect(res.body.data).toEqual(mockSafetyRecords);
  });

  it("should return 500 if there is an error getting the safety records", async () => {
    userService.getSafetyRecordsById = jest
      .fn()
      .mockRejectedValue(new Error("Error"));

    const res = await request(app).get("/api/users/userId/safety-records");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error getting safety records.");
    expect(res.body.error.code).toBe("GET_SAFETY_RECORDS_ERROR");
  });
});

describe("UserController - updateUsername", () => {
  it("should return 403 if user is not the same as the requested user", async () => {
    const res = await request(app)
      .put("/api/users/anotherUserId/username")
      .send({ username: "newUsername" });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden to update this user.");
    expect(res.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 400 if username is invalid", async () => {
    const res = await request(app)
      .put("/api/users/userId/username")
      .send({ username: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid username.");
    expect(res.body.error.code).toBe("INVALID_USERNAME");
  });

  it("should return 409 if username is already taken", async () => {
    userService.getUserByUsername = jest
      .fn()
      .mockResolvedValue({ id: "anotherUserId" });

    const res = await request(app)
      .put("/api/users/userId/username")
      .send({ username: "existingUsername" });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Username already taken.");
    expect(res.body.error.code).toBe("USERNAME_TAKEN");
  });

  it("should return 200 and update the username if valid", async () => {
    userService.getUserByUsername = jest.fn().mockResolvedValue(null);
    userService.updateUserById = jest
      .fn()
      .mockResolvedValue({ _id: "userId", username: "newUsername" });

    const res = await request(app)
      .put("/api/users/userId/username")
      .send({ username: "newUsername" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Username updated successfully.");
    expect(res.body.data).toEqual({ _id: "userId", username: "newUsername" });
  });

  it("should return 500 if there is an error updating the username", async () => {
    userService.getUserByUsername = jest.fn().mockResolvedValue(null);
    userService.updateUserById = jest
      .fn()
      .mockRejectedValue(new Error("Error"));

    const res = await request(app)
      .put("/api/users/userId/username")
      .send({ username: "newUsername" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error updating username.");
    expect(res.body.error.code).toBe("UPDATE_USERNAME_ERROR");
  });
});

describe("UserController - updateDisplayName", () => {
  it("should return 403 if user is not the same as the requested user", async () => {
    const res = await request(app)
      .put("/api/users/anotherUserId/display-name")
      .send({ displayName: "New DisplayName" });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden to update this user.");
    expect(res.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 400 if display name is invalid", async () => {
    const res = await request(app)
      .put("/api/users/userId/display-name")
      .send({ displayName: " " });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid display name.");
    expect(res.body.error.code).toBe("INVALID_DISPLAY_NAME");
  });

  it("should return 200 and update the display name if valid", async () => {
    userService.updateUserById = jest
      .fn()
      .mockResolvedValue({ _id: "userId", displayName: "New DisplayName" });

    const res = await request(app)
      .put("/api/users/userId/display-name")
      .send({ displayName: "New DisplayName" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Display name updated successfully.");
    expect(res.body.data).toEqual({
      _id: "userId",
      displayName: "New DisplayName",
    });
  });

  it("should return 500 if there is an error updating the display name", async () => {
    userService.updateUserById = jest
      .fn()
      .mockRejectedValue(new Error("Error"));

    const res = await request(app)
      .put("/api/users/userId/display-name")
      .send({ displayName: "New DisplayName" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error updating display name.");
    expect(res.body.error.code).toBe("UPDATE_DISPLAY_NAME_ERROR");
  });
});

describe("UserController - updateEmail", () => {
  it("should return 403 if user is not the same as the requested user", async () => {
    const res = await request(app).put("/api/users/anotherUserId/email").send({
      email: "newemail@example.com",
      callbackUrl: "http://example.com",
    });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden to update this user.");
    expect(res.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 400 if email is invalid", async () => {
    const res = await request(app)
      .put("/api/users/userId/email")
      .send({ email: "invalidemail", callbackUrl: "http://example.com" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid email.");
    expect(res.body.error.code).toBe("INVALID_EMAIL");
  });

  it("should return 409 if email is already taken", async () => {
    userService.getUserByEmail = jest
      .fn()
      .mockResolvedValue({ id: "anotherUserId" });

    const res = await request(app).put("/api/users/userId/email").send({
      email: "existingemail@example.com",
      callbackUrl: "http://example.com",
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Email already taken.");
    expect(res.body.error.code).toBe("EMAIL_TAKEN");
  });

  it("should return 200 and send email verification if valid", async () => {
    userService.getUserByEmail = jest.fn().mockResolvedValue(null);
    jwtService.generateToken = jest.fn().mockReturnValue("mockToken");
    emailService.sendEmailVerification = jest.fn().mockResolvedValue();

    const res = await request(app).put("/api/users/userId/email").send({
      email: "newemail@example.com",
      callbackUrl: "http://example.com",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Email verification sent successfully.");
  });

  it("should return 500 if there is an error sending the verification email", async () => {
    userService.getUserByEmail = jest.fn().mockResolvedValue(null);
    jwtService.generateToken = jest.fn().mockReturnValue("mockToken");
    emailService.sendEmailVerification = jest
      .fn()
      .mockRejectedValue(new Error("Error"));

    const res = await request(app).put("/api/users/userId/email").send({
      email: "newemail@example.com",
      callbackUrl: "http://example.com",
    });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error sending verification email.");
    expect(res.body.error.code).toBe("SEND_EMAIL_ERROR");
  });
});

describe("UserController - completeEmailUpdate", () => {
  it("should return 403 if user is not the same as the requested user", async () => {
    const res = await request(app)
      .put("/api/users/anotherUserId/email/complete")
      .send({ token: "mockToken" });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden to update this user.");
    expect(res.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 400 if token is invalid", async () => {
    jwtService.verifyToken = jest.fn().mockImplementation(() => {
      const error = new Error("Invalid token");
      error.name = "JsonWebTokenError";
      throw error;
    });

    const res = await request(app)
      .put("/api/users/userId/email/complete")
      .send({ token: "invalidToken" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid token.");
    expect(res.body.error.code).toBe("INVALID_TOKEN");
  });

  it("should return 401 if token is expired", async () => {
    jwtService.verifyToken = jest.fn().mockImplementation(() => {
      const error = new Error("TokenExpiredError");
      error.name = "TokenExpiredError";
      throw error;
    });

    const res = await request(app)
      .put("/api/users/userId/email/complete")
      .send({ token: "expiredToken" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Token expired.");
    expect(res.body.error.code).toBe("TOKEN_EXPIRED");
  });

  it("should return 500 if there is an error verifying the token", async () => {
    jwtService.verifyToken = jest.fn().mockImplementation(() => {
      throw new Error("Error");
    });

    const res = await request(app)
      .put("/api/users/userId/email/complete")
      .send({ token: "mockToken" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error verifying token.");
    expect(res.body.error.code).toBe("VERIFY_TOKEN_ERROR");
  });

  it("should return 200 and update the email if valid", async () => {
    jwtService.verifyToken = jest
      .fn()
      .mockReturnValue({ email: "newemail@example.com" });
    userService.getUserById = jest.fn().mockResolvedValue({ _id: "userId" });
    userService.updateUserById = jest
      .fn()
      .mockResolvedValue({ _id: "userId", email: "newemail@example.com" });

    const res = await request(app)
      .put("/api/users/userId/email/complete")
      .send({ token: "mockToken" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Email updated successfully.");
    expect(res.body.data).toEqual({
      _id: "userId",
      email: "newemail@example.com",
    });
  });

  it("should return 500 if there is an error updating the email", async () => {
    jwtService.verifyToken = jest
      .fn()
      .mockReturnValue({ email: "newemail@example.com" });
    userService.getUserById = jest.fn().mockResolvedValue({ _id: "userId" });
    userService.updateUserById = jest
      .fn()
      .mockRejectedValue(new Error("Error"));

    const res = await request(app)
      .put("/api/users/userId/email/complete")
      .send({ token: "mockToken" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error updating email.");
    expect(res.body.error.code).toBe("UPDATE_EMAIL_ERROR");
  });
});

describe("UserController - updatePassword", () => {
  it("should return 403 if user is not the same as the requested user", async () => {
    const res = await request(app)
      .put("/api/users/anotherUserId/password")
      .send({
        currentPassword: "CurrentPassword123!",
        newPassword: "NewPassword123!",
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden to update this user.");
    expect(res.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 400 if current password is invalid", async () => {
    const res = await request(app)
      .put("/api/users/userId/password")
      .send({ currentPassword: "", newPassword: "NewPassword123!" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid password.");
    expect(res.body.error.code).toBe("INVALID_PASSWORD");
  });

  it("should return 400 if new password is invalid", async () => {
    const res = await request(app)
      .put("/api/users/userId/password")
      .send({ currentPassword: "CurrentPassword123!", newPassword: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid new password.");
    expect(res.body.error.code).toBe("INVALID_NEW_PASSWORD");
  });

  it("should return 404 if user is not found", async () => {
    userService.getUserById = jest.fn().mockResolvedValue(null);

    const res = await request(app).put("/api/users/userId/password").send({
      currentPassword: "CurrentPassword123!",
      newPassword: "NewPassword123!",
    });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found.");
    expect(res.body.error.code).toBe("USER_NOT_FOUND");
  });

  it("should return 401 if current password is incorrect", async () => {
    const mockUser = { _id: "userId", password: "hashedPassword" };
    userService.getUserById = jest.fn().mockResolvedValue(mockUser);
    verifyPassword.mockResolvedValue(false);

    const res = await request(app).put("/api/users/userId/password").send({
      currentPassword: "wrongPassword123!",
      newPassword: "NewPassword123!",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Incorrect password.");
    expect(res.body.error.code).toBe("INCORRECT_PASSWORD");
  });

  it("should return 200 and update the password if valid", async () => {
    const mockUser = { _id: "userId", password: "hashedPassword" };
    userService.getUserById = jest.fn().mockResolvedValue(mockUser);
    verifyPassword.mockResolvedValue(true);
    userService.updateUserById = jest
      .fn()
      .mockResolvedValue({ _id: "userId", password: "NewPassword123!" });

    const res = await request(app).put("/api/users/userId/password").send({
      currentPassword: "CurrentPassword123!",
      newPassword: "NewPassword123!",
    });
    expect(res.body.message).toBe("Password updated successfully.");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Password updated successfully.");
    expect(res.body.data).toEqual(null);
  });

  it("should return 500 if there is an error updating the password", async () => {
    const mockUser = { _id: "userId", password: "hashedPassword" };
    userService.getUserById = jest.fn().mockResolvedValue(mockUser);
    verifyPassword.mockResolvedValue(true);
    userService.updateUserById = jest
      .fn()
      .mockRejectedValue(new Error("Error"));

    const res = await request(app).put("/api/users/userId/password").send({
      currentPassword: "CurrentPassword123!",
      newPassword: "NewPassword123!",
    });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error updating password.");
    expect(res.body.error.code).toBe("UPDATE_PASSWORD_ERROR");
  });
});
