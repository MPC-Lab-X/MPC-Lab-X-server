/**
 * @file tests/services/userService.test.js
 * @description Tests for the user service functions.
 */

const User = require("../../src/models/userSchema");
const userService = require("../../src/services/userService");
const {
  hashPassword,
  verifyPassword,
} = require("../../src/services/passwordHashService");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.mock("../../src/services/passwordHashService", () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
}));

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("User Service", () => {
  describe("createUser", () => {
    it("should create a new user with a hashed password", async () => {
      const user = {
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
        locked: false,
      };

      hashPassword.mockResolvedValue("hashedpassword123");

      const createdUser = await userService.createUser(user);
      expect(createdUser).toHaveProperty("username", user.username);
      expect(createdUser).toHaveProperty("email", user.email);
      expect(createdUser).toHaveProperty("password", "hashedpassword123");
    });

    it("should throw an error if password is not provided", async () => {
      const user = {
        username: "testuser",
        email: "testuser@example.com",
        locked: false,
      };

      await expect(userService.createUser(user)).rejects.toThrow(
        "Password is required"
      );
    });
  });

  describe("loginUser", () => {
    it("should log in a user with valid credentials", async () => {
      const user = {
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
        locked: false,
      };

      hashPassword.mockResolvedValue("hashedpassword123");
      verifyPassword.mockResolvedValue(true);

      await userService.createUser(user);

      const loggedInUser = await userService.loginUser(
        user.email,
        "password123"
      );
      expect(loggedInUser).toHaveProperty("username", user.username);
      expect(loggedInUser).toHaveProperty("email", user.email);
    });

    it("should throw an error if the user is not found", async () => {
      await expect(
        userService.loginUser("nonexistent@example.com", "password123")
      ).rejects.toEqual({
        message: "User not found",
        user: null,
      });
    });

    it("should throw an error if the password is invalid", async () => {
      const user = {
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
        locked: false,
      };

      hashPassword.mockResolvedValue("hashedpassword123");
      verifyPassword.mockResolvedValue(false);

      await userService.createUser(user);

      await expect(
        userService.loginUser(user.email, "wrongpassword")
      ).rejects.toEqual({
        message: "Invalid password",
        user: expect.any(Object),
      });
    });

    it("should throw an error if the account is locked", async () => {
      const user = {
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
        locked: true,
      };

      hashPassword.mockResolvedValue("hashedpassword123");
      verifyPassword.mockResolvedValue(true);

      await userService.createUser(user);

      await expect(
        userService.loginUser(user.email, "password123")
      ).rejects.toEqual({
        message: "Account locked",
        user: expect.any(Object),
      });
    });
  });

  describe("getRefreshTokenSecret", () => {
    it("should return the refresh token secret for a valid user", async () => {
      const user = {
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
        locked: false,
      };

      hashPassword.mockResolvedValue("hashedpassword123");

      const createdUser = await userService.createUser(user);
      const secret = "mysecretkey";
      const refreshTokenSecret = await userService.getRefreshTokenSecret(
        createdUser._id,
        secret
      );

      expect(refreshTokenSecret).toBe(
        `mysecretkey.hashedpassword123.${createdUser.locked}`
      );
    });

    it("should throw an error if the user ID is invalid", async () => {
      const invalidUserId = "invalidUserId";
      const secret = "mysecretkey";

      await expect(
        userService.getRefreshTokenSecret(invalidUserId, secret)
      ).rejects.toThrow("Invalid user ID");
    });

    it("should throw an error if the user is not found", async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();
      const secret = "mysecretkey";

      await expect(
        userService.getRefreshTokenSecret(nonExistentUserId, secret)
      ).rejects.toThrow("User not found");
    });
  });

  describe("getUserById", () => {
    it("should return a user if a valid ID is provided", async () => {
      const user = {
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
        locked: false,
      };

      hashPassword.mockResolvedValue("hashedpassword123");

      const createdUser = await userService.createUser(user);
      const foundUser = await userService.getUserById(createdUser._id);

      expect(foundUser).toHaveProperty("username", user.username);
      expect(foundUser).toHaveProperty("email", user.email);
    });

    it("should return null if an invalid ID is provided", async () => {
      const invalidUserId = "invalidUserId";
      const foundUser = await userService.getUserById(invalidUserId);

      expect(foundUser).toBeNull();
    });

    it("should return null if the user is not found", async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();
      await expect(
        userService.getUserById(nonExistentUserId)
      ).resolves.toBeNull();
    });
  });

  describe("getUserByEmail", () => {
    it("should return a user if a valid email is provided", async () => {
      const user = {
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
        locked: false,
      };

      hashPassword.mockResolvedValue("hashedpassword123");

      await userService.createUser(user);
      const foundUser = await userService.getUserByEmail(user.email);

      expect(foundUser).toHaveProperty("username", user.username);
      expect(foundUser).toHaveProperty("email", user.email);
    });

    it("should return null if an invalid email is provided", async () => {
      const invalidEmail = "invalid@example.com";
      const foundUser = await userService.getUserByEmail(invalidEmail);

      expect(foundUser).toBeNull();
    });

    it("should return null if the user is not found", async () => {
      await expect(userService.getUserByEmail()).resolves.toBeNull();
    });
  });

  describe("getUserByUsername", () => {
    it("should return a user if a valid username is provided", async () => {
      const user = {
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
        locked: false,
      };

      hashPassword.mockResolvedValue("hashedpassword123");

      await userService.createUser(user);
      const foundUser = await userService.getUserByUsername(user.username);

      expect(foundUser).toHaveProperty("username", user.username);
      expect(foundUser).toHaveProperty("email", user.email);
    });

    it("should return null if an invalid username is provided", async () => {
      const invalidUsername = "invaliduser";
      const foundUser = await userService.getUserByUsername(invalidUsername);

      expect(foundUser).toBeNull();
    });

    it("should return null if the user is not found", async () => {
      await expect(userService.getUserByUsername()).resolves.toBeNull();
    });
  });

  describe("updateUserById", () => {
    it("should update a user if a valid ID and update object are provided", async () => {
      const user = {
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
        locked: false,
      };

      hashPassword.mockResolvedValue("hashedpassword123");

      const createdUser = await userService.createUser(user);
      const update = { username: "updateduser" };

      const updatedUser = await userService.updateUserById(
        createdUser._id,
        update
      );

      expect(updatedUser).toHaveProperty("username", update.username);
      expect(updatedUser).toHaveProperty("email", user.email);
    });

    it("should return null if an invalid ID is provided", async () => {
      const invalidUserId = "invalidUserId";
      const update = { username: "updateduser" };

      const updatedUser = await userService.updateUserById(
        invalidUserId,
        update
      );

      expect(updatedUser).toBeNull();
    });

    it("should throw an error if the user is not found", async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();
      const update = { username: "updateduser" };

      await expect(
        userService.updateUserById(nonExistentUserId, update)
      ).rejects.toThrow("User not found");
    });
  });

  describe("addSafetyRecordById", () => {
    it("should add a safety record to a user by ID", async () => {
      const user = {
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
        locked: false,
      };

      hashPassword.mockResolvedValue("hashedpassword123");

      const createdUser = await userService.createUser(user);
      const safetyRecord = {
        type: "login",
        ip: "127.0.0.1",
        device: "PC",
      };

      await userService.addSafetyRecordById(
        createdUser._id,
        safetyRecord.type,
        safetyRecord.ip,
        safetyRecord.device
      );

      const updatedUserSafetyRecords = await userService.getSafetyRecordsById(
        createdUser._id,
        10,
        0
      );

      expect(updatedUserSafetyRecords).toHaveLength(1);
      expect(updatedUserSafetyRecords[0]).toMatchObject(safetyRecord);
    });

    it("should throw an error if the user ID is invalid", async () => {
      const invalidUserId = "invalidUserId";
      const safetyRecord = {
        type: "login",
        ip: "127.0.0.1",
        device: "PC",
      };

      await expect(
        userService.addSafetyRecordById(
          invalidUserId,
          safetyRecord.type,
          safetyRecord.ip,
          safetyRecord.device
        )
      ).rejects.toThrow("Invalid user ID");
    });

    it("should throw an error if the user is not found", async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();
      const safetyRecord = {
        type: "login",
        ip: "127.0.0.1",
        device: "PC",
      };

      await expect(
        userService.addSafetyRecordById(
          nonExistentUserId,
          safetyRecord.type,
          safetyRecord.ip,
          safetyRecord.device
        )
      ).rejects.toThrow("User not found");
    });

    it("should limit the safety records to 100 records", async () => {
      const user = {
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
        locked: false,
      };

      hashPassword.mockResolvedValue("hashedpassword123");

      const createdUser = await userService.createUser(user);

      for (let i = 0; i < 105; i++) {
        await userService.addSafetyRecordById(
          createdUser._id,
          "login",
          `127.0.0.${i}`,
          "PC"
        );
      }

      const updatedUserSafetyRecords = await userService.getSafetyRecordsById(
        createdUser._id,
        120,
        0
      );
      expect(updatedUserSafetyRecords).toHaveLength(100);
    });
  });

  describe("getSafetyRecordsById", () => {
    it("should return safety records for a valid user ID", async () => {
      const user = {
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
        locked: false,
      };

      hashPassword.mockResolvedValue("hashedpassword123");

      const createdUser = await userService.createUser(user);
      const safetyRecord = {
        type: "login",
        ip: "127.0.0.1",
        device: "PC",
      };

      await userService.addSafetyRecordById(
        createdUser._id,
        safetyRecord.type,
        safetyRecord.ip,
        safetyRecord.device
      );

      const safetyRecords = await userService.getSafetyRecordsById(
        createdUser._id,
        10,
        0
      );

      expect(safetyRecords).toHaveLength(1);
      expect(safetyRecords[0]).toMatchObject(safetyRecord);
    });

    it("should return null if an invalid user ID is provided", async () => {
      const invalidUserId = "invalidUserId";
      const safetyRecords = await userService.getSafetyRecordsById(
        invalidUserId,
        10,
        0
      );

      expect(safetyRecords).toBeNull();
    });

    it("should throw an error if the user is not found", async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();

      await expect(
        userService.getSafetyRecordsById(nonExistentUserId, 10, 0)
      ).rejects.toThrow("User not found or no safety records");
    });

    it("should return the correct number of safety records based on limit and offset", async () => {
      const user = {
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
        locked: false,
      };

      hashPassword.mockResolvedValue("hashedpassword123");

      const createdUser = await userService.createUser(user);

      for (let i = 0; i < 15; i++) {
        await userService.addSafetyRecordById(
          createdUser._id,
          "login",
          `127.0.0.${i}`,
          "PC"
        );
      }

      const safetyRecords = await userService.getSafetyRecordsById(
        createdUser._id,
        10,
        5
      );

      expect(safetyRecords).toHaveLength(10);
    });
  });
});
