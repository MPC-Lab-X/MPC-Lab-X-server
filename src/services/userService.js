/**
 * @file src/services/userService.js
 * @description User service for interacting with the database.
 */

const User = require("../models/userSchema");
const { hashPassword, verifyPassword } = require("./passwordHashService");

/**
 * @function createUser - Create a new user.
 * @param {Object} user - The user object to create.
 * @returns {Promise<Object>} The created user object.
 * @throws {Error} Throws an error if the user fails to create.
 */
const createUser = async (user) => {
  try {
    if (user.password) {
      user.password = await hashPassword(user.password);
    } else {
      throw new Error("Password is required");
    }
    const newUser = new User(user);
    const savedUser = await newUser.save();
    return savedUser;
  } catch (error) {
    console.error("Error in creating user: ", error);
    throw error;
  }
};

/**
 * @function loginUser - Log in a user.
 * @param {string} identifier - The user's email or username.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} The logged in user object.
 * @throws {Error} Throws an error if the login fails.
 */
const loginUser = async (identifier, password) => {
  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) {
      throw new Error("User not found");
    }
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      throw new Error("Invalid password");
    }
    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = { createUser, loginUser };
