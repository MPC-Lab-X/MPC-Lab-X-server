/**
 * @file src/services/passwordHashService.js
 * @description Password hashing and verification service.
 */

const bcrypt = require("bcryptjs");

/**
 * @function hashPassword - Hash a password using bcrypt.
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} - The hashed password.
 * @throws {Error} - Throws an error if the password fails to hash.
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error("Error in hashing password: ", error);
    throw error;
  }
};

/**
 * @function verifyPassword - Verify a password against a hash.
 * @param {string} password - The password to verify.
 * @param {string} hash - The hash to verify the password against.
 * @returns {Promise<boolean>} - A promise that resolves to true if the password is valid, false otherwise.
 * @throws {Error} - Throws an error if the password verification fails.
 */

const verifyPassword = async (password, hash) => {
  try {
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  } catch (error) {
    console.error("Error in verifying password: ", error);
    throw error;
  }
};

module.exports = { hashPassword, verifyPassword };
