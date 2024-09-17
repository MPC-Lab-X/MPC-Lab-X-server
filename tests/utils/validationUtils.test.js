/**
 * @file tests/utils/validationUtils.test.js
 * @description Tests for the validation utility functions.
 */

const {
  validateEmail,
  validatePassword,
  validateUsername,
  validateDisplayName,
  validateIdentifier,
  validateLimit,
  validateOffset,
} = require("../../src/utils/validationUtils");

describe("validateEmail", () => {
  test("should return false for an empty email", () => {
    expect(validateEmail("")).toBe(false);
  });

  test("should return false for an email longer than 254 characters", () => {
    const longEmail = "a".repeat(255) + "@example.com";
    expect(validateEmail(longEmail)).toBe(false);
  });

  test('should return false for an email without "@" symbol', () => {
    expect(validateEmail("example.com")).toBe(false);
  });

  test("should return false for an email without a period", () => {
    expect(validateEmail("example@com")).toBe(false);
  });

  test("should return true for a valid email", () => {
    expect(validateEmail("test@example.com")).toBe(true);
  });

  test("should return false for an email with spaces", () => {
    expect(validateEmail("test @example.com")).toBe(false);
  });

  test("should return false for an email with invalid characters", () => {
    expect(validateEmail("test@exa!mple.com")).toBe(false);
  });
});

describe("validatePassword", () => {
  test("should return false for an empty password", () => {
    expect(validatePassword("")).toBe(false);
  });

  test("should return false for a password shorter than 8 characters", () => {
    expect(validatePassword("Ab1!")).toBe(false);
  });

  test("should return false for a password without an uppercase letter", () => {
    expect(validatePassword("abcdefg1!")).toBe(false);
  });

  test("should return false for a password without a lowercase letter", () => {
    expect(validatePassword("ABCDEFG1!")).toBe(false);
  });

  test("should return false for a password without a number", () => {
    expect(validatePassword("Abcdefg!")).toBe(false);
  });

  test("should return false for a password without a special character", () => {
    expect(validatePassword("Abcdefg1")).toBe(false);
  });

  test("should return true for a valid password", () => {
    expect(validatePassword("Abcdefg1!")).toBe(true);
  });

  test("should return false for a password with spaces", () => {
    expect(validatePassword("Abc defg1!")).toBe(false);
  });
});

describe("validateUsername", () => {
  test("should return false for an empty username", () => {
    expect(validateUsername("")).toBe(false);
  });

  test("should return false for a username shorter than 3 characters", () => {
    expect(validateUsername("ab")).toBe(false);
  });

  test("should return false for a username with invalid characters", () => {
    expect(validateUsername("user!name")).toBe(false);
  });

  test("should return true for a valid username with alphanumeric characters", () => {
    expect(validateUsername("username123")).toBe(true);
  });

  test("should return true for a valid username with underscores", () => {
    expect(validateUsername("user_name")).toBe(true);
  });

  test("should return false for a username with spaces", () => {
    expect(validateUsername("user name")).toBe(false);
  });

  test("should return true for a valid username with mixed case", () => {
    expect(validateUsername("UserName")).toBe(true);
  });
});

describe("validateDisplayName", () => {
  test("should return true for a display name that is empty", () => {
    expect(validateDisplayName("")).toBe(true);
  });

  test("should return false for a display name with leading spaces", () => {
    expect(validateDisplayName(" leading")).toBe(false);
  });

  test("should return false for a display name with trailing spaces", () => {
    expect(validateDisplayName("trailing ")).toBe(false);
  });

  test("should return false for a display name with consecutive spaces", () => {
    expect(validateDisplayName("consecutive  spaces")).toBe(false);
  });

  test("should return false for a display name longer than 20 characters", () => {
    expect(validateDisplayName("a".repeat(21))).toBe(false);
  });

  test("should return true for a valid display name", () => {
    expect(validateDisplayName("ValidName")).toBe(true);
  });

  test("should return true for a valid display name with spaces", () => {
    expect(validateDisplayName("Valid Name")).toBe(true);
  });

  test("should return false for a display name that is null", () => {
    expect(validateDisplayName(null)).toBe(false);
  });

  test("should return false for a display name that is undefined", () => {
    expect(validateDisplayName(undefined)).toBe(false);
  });
});

describe("validateIdentifier", () => {
  test("should return true for a valid email", () => {
    expect(validateIdentifier("test@example.com")).toBe(true);
  });

  test("should return true for a valid username", () => {
    expect(validateIdentifier("username123")).toBe(true);
  });

  test("should return false for an empty identifier", () => {
    expect(validateIdentifier("")).toBe(false);
  });

  test("should return false for an invalid email", () => {
    expect(validateIdentifier("invalid-email")).toBe(false);
  });

  test("should return false for an invalid username", () => {
    expect(validateIdentifier("user!name")).toBe(false);
  });

  test("should return false for an email longer than 254 characters", () => {
    const longEmail = "a".repeat(255) + "@example.com";
    expect(validateIdentifier(longEmail)).toBe(false);
  });

  test("should return false for a username shorter than 3 characters", () => {
    expect(validateIdentifier("ab")).toBe(false);
  });

  test('should return false for an email without "@" symbol', () => {
    expect(validateIdentifier("example.com")).toBe(false);
  });

  test("should return false for an email without a period", () => {
    expect(validateIdentifier("example@com")).toBe(false);
  });

  test("should return false for an identifier with spaces", () => {
    expect(validateIdentifier("test @example.com")).toBe(false);
    expect(validateIdentifier("user name")).toBe(false);
  });
});

describe("validateLimit", () => {
  test("should return false for a non-numeric limit", () => {
    expect(validateLimit("abc")).toBe(false);
  });

  test("should return false for a negative limit", () => {
    expect(validateLimit("-1")).toBe(false);
  });

  test("should return false for a limit of zero", () => {
    expect(validateLimit("0")).toBe(false);
  });

  test("should return false for a limit greater than 100", () => {
    expect(validateLimit("101")).toBe(false);
  });

  test("should return true for a valid limit within range", () => {
    expect(validateLimit("50")).toBe(true);
  });

  test("should return true for a limit of 1", () => {
    expect(validateLimit("1")).toBe(true);
  });

  test("should return true for a limit of 100", () => {
    expect(validateLimit("100")).toBe(true);
  });
});

describe("validateOffset", () => {
  test("should return false for a non-numeric offset", () => {
    expect(validateOffset("abc")).toBe(false);
  });

  test("should return false for a negative offset", () => {
    expect(validateOffset("-1")).toBe(false);
  });

  test("should return true for an offset of zero", () => {
    expect(validateOffset("0")).toBe(true);
  });

  test("should return true for a positive offset", () => {
    expect(validateOffset("10")).toBe(true);
  });

  test("should return true for an offset string that is a number", () => {
    expect(validateOffset("5")).toBe(true);
  });

  test("should return false for an offset that is null", () => {
    expect(validateOffset(null)).toBe(false);
  });

  test("should return false for an offset that is undefined", () => {
    expect(validateOffset(undefined)).toBe(false);
  });
});
