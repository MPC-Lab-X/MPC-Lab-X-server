/**
 * @file src/services/userService.js
 * @description User service for interacting with the database.
 */

const mongoose = require("mongoose");
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
    }).select("+password");
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

/**
 * @function getUserById - Get a user by ID.
 * @param {string} userId - The user's ID.
 * @returns {Promise<Object>} The user object.
 * @throws {Error} Throws an error if the user fails to get.
 */
const getUserById = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    console.error("Error in getting user by ID: ", error);
    throw error;
  }
};

/**
 * @function getUserByEmail - Get a user by email.
 * @param {string} email - The user's email.
 * @returns {Promise<Object>} The user object.
 * @throws {Error} Throws an error if the user fails to get.
 */
const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.error("Error in getting user by email: ", error);
    throw error;
  }
};

/**
 * @function getUserByUsername - Get a user by username.
 * @param {string} username - The user's username.
 * @returns {Promise<Object>} The user object.
 * @throws {Error} Throws an error if the user fails to get.
 */
const getUserByUsername = async (username) => {
  try {
    const user = await User.findOne({ username });
    return user;
  } catch (error) {
    console.error("Error in getting user by username: ", error);
    throw error;
  }
};

/**
 * @function updateUserById - Update a user by ID.
 * @param {string} userId - The user's ID.
 * @param {Object} update - The user object to update.
 * @returns {Promise<Object>} The updated user object.
 * @throws {Error} Throws an error if the user fails to update.
 */
const updateUserById = async (userId, update) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, update, {
      new: true,
    });
    if (!updatedUser) {
      throw new Error("User not found");
    }
    return updatedUser;
  } catch (error) {
    console.error("Error in updating user by ID: ", error);
    throw error;
  }
};

module.exports = {
  createUser,
  loginUser,
  getUserById,
  getUserByEmail,
  getUserByUsername,
  updateUserById,
};
