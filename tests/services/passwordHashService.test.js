/**
 * @file tests/services/passwordHashService.test.js
 * @description Tests for the password hashing and verification service functions.
 */

const {
  hashPassword,
  verifyPassword,
} = require("../../src/services/passwordHashService");
const bcrypt = require("bcryptjs");

describe("hashPassword", () => {
  it("should hash a password successfully", async () => {
    const password = "testPassword123";
    const hashedPassword = await hashPassword(password);

    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(password);
    const isMatch = await bcrypt.compare(password, hashedPassword);
    expect(isMatch).toBe(true);
  });

  it("should throw an error if password hashing fails", async () => {
    const password = "testPassword123";
    jest.spyOn(bcrypt, "genSalt").mockImplementation(() => {
      throw new Error("Salt generation failed");
    });

    await expect(hashPassword(password)).rejects.toThrow(
      "Salt generation failed"
    );

    bcrypt.genSalt.mockRestore();
  });
});

describe("verifyPassword", () => {
  it("should verify a password successfully", async () => {
    const password = "testPassword123";
    const hash = await bcrypt.hash(password, 10);

    const isValid = await verifyPassword(password, hash);

    expect(isValid).toBe(true);
  });

  it("should return false for an incorrect password", async () => {
    const password = "testPassword123";
    const incorrectPassword = "wrongPassword123";
    const hash = await bcrypt.hash(password, 10);

    const isValid = await verifyPassword(incorrectPassword, hash);

    expect(isValid).toBe(false);
  });

  it("should throw an error if password verification fails", async () => {
    const password = "testPassword123";
    const hash = await bcrypt.hash(password, 10);

    jest.spyOn(bcrypt, "compare").mockImplementation(() => {
      throw new Error("Password verification failed");
    });

    await expect(verifyPassword(password, hash)).rejects.toThrow(
      "Password verification failed"
    );

    bcrypt.compare.mockRestore();
  });
});
