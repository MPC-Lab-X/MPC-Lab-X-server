/**
 * @file src/controllers/userController.js
 * @description User controller for handling user operations.
 */

const userService = require("../services/userService");
const emailService = require("../services/emailService");
const jwtService = require("../services/jwtService");

const { verifyPassword } = require("../services/passwordHashService");

const validationUtils = require("../utils/validationUtils");

/**
 * @function getUser - Get a user by ID.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userService.getUserById(id);

    // Check if user exists
    if (!user) {
      return res.notFound("User not found.", "USER_NOT_FOUND");
    }

    return res.success(user, "User found successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error getting user.",
      "GET_USER_ERROR",
      error
    );
  }
};

/**
 * @function updateUsername - Update a user's username.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const updateUsername = async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  // Check if user is authorized to update
  if (req.user.userId !== id) {
    return res.unauthorized(
      "Unauthorized to update this user.",
      "UNAUTHORIZED"
    );
  }

  // Check if username is valid
  if (!validationUtils.validateUsername(username)) {
    return res.badRequest("Invalid username.", "INVALID_USERNAME");
  }

  // Check if username is already taken
  const existingUser = await userService.getUserByUsername(username);
  if (existingUser) {
    return res.conflict("Username already taken.", "USERNAME_TAKEN");
  }

  // Update username
  try {
    const user = await userService.updateUserById(id, { username });
    return res.success(user, "Username updated successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error updating username.",
      "UPDATE_USERNAME_ERROR",
      error
    );
  }
};

/**
 * @function updateDisplayName - Update a user's display name.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const updateDisplayName = async (req, res) => {
  const { id } = req.params;
  const { displayName } = req.body;

  // Check if user is authorized to update
  if (req.user.userId !== id) {
    return res.unauthorized(
      "Unauthorized to update this user.",
      "UNAUTHORIZED"
    );
  }

  // Check if display name is valid
  if (!validationUtils.validateDisplayName(displayName)) {
    return res.badRequest("Invalid display name.", "INVALID_DISPLAY_NAME");
  }

  // Update display name
  try {
    const user = await userService.updateUserById(id, { displayName });
    return res.success(user, "Display name updated successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error updating display name.",
      "UPDATE_DISPLAY_NAME_ERROR",
      error
    );
  }
};

/**
 * @function updateEmail - Handle updating a user's email request.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const updateEmail = async (req, res) => {
  const { id } = req.params;
  const { email, callbackUrl } = req.body;

  // Check if user is authorized to update
  if (req.user.userId !== id) {
    return res.unauthorized(
      "Unauthorized to update this user.",
      "UNAUTHORIZED"
    );
  }

  // Check if email is valid
  if (!validationUtils.validateEmail(email)) {
    return res.badRequest("Invalid email.", "INVALID_EMAIL");
  }

  // Check if email is already taken
  const existingUser = await userService.getUserByEmail(email);
  if (existingUser) {
    return res.conflict("Email already taken.", "EMAIL_TAKEN");
  }

  // Generate a JWT token for email verification
  const token = jwtService.generateToken(
    { email },
    process.env.EMAIL_SECRET,
    "1h"
  );

  // Send email verification
  try {
    await emailService.sendEmailVerification(email, token, callbackUrl);
    return res.success(null, "Email verification sent successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error sending verification email.",
      "SEND_EMAIL_ERROR",
      error
    );
  }
};

/**
 * @function completeEmailUpdate - Handle completing an email update request.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const completeEmailUpdate = async (req, res) => {
  const { id } = req.params;
  const { token } = req.body;

  // Check if user is authorized to update
  if (req.user.userId !== id) {
    return res.unauthorized(
      "Unauthorized to update this user.",
      "UNAUTHORIZED"
    );
  }

  let email;

  // Verify the token
  try {
    const payload = jwtService.verifyToken(token, process.env.EMAIL_SECRET);
    if (!payload.email) {
      return res.badRequest("Invalid token.", "INVALID_TOKEN");
    }
    email = payload.email;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.unauthorized("Token expired.", "TOKEN_EXPIRED");
    }
    if (error.name === "JsonWebTokenError") {
      return res.badRequest("Invalid token.", "INVALID_TOKEN");
    } else {
      return res.internalServerError(
        "Error verifying token.",
        "VERIFY_TOKEN_ERROR"
      );
    }
  }

  // Update email
  try {
    const user = await userService.updateUserById(id, { email });
    return res.success(user, "Email updated successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error updating email.",
      "UPDATE_EMAIL_ERROR",
      error
    );
  }
};

/**
 * @function updatePassword - Handle updating a user's password.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  // Check if user is authorized to update
  if (req.user.userId !== id) {
    return res.unauthorized(
      "Unauthorized to update this user.",
      "UNAUTHORIZED"
    );
  }

  // Check if the current password is valid
  if (!currentPassword || !validationUtils.validatePassword(currentPassword)) {
    return res.badRequest("Invalid password.", "INVALID_PASSWORD");
  }

  // Check if the new password is valid
  if (!newPassword || !validationUtils.validatePassword(newPassword)) {
    return res.badRequest("Invalid new password.", "INVALID_PASSWORD");
  }

  // Check if user exists
  const user = await userService.getUserById(id);
  if (!user) {
    return res.notFound("User not found.", "USER_NOT_FOUND");
  }

  // Check if current password is correct
  const isMatch = await verifyPassword(currentPassword, user.password);
  if (!isMatch) {
    return res.unauthorized("Invalid password.", "INVALID_PASSWORD");
  }

  // Update password
  try {
    const updatedUser = await userService.updateUserById(user._id, {
      password: newPassword,
    });
    return res.success(updatedUser, "Password updated successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error updating password.",
      "UPDATE_PASSWORD_ERROR",
      error
    );
  }
};

module.exports = {
  getUser,
  updateUsername,
  updateDisplayName,
  updateEmail,
  completeEmailUpdate,
  updatePassword,
};
