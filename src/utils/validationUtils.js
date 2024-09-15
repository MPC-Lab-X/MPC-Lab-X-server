/**
 * @file src/utils/validationUtils.js
 * @description Validation utility functions.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Check if the email is valid (contains an @ symbol and a period)
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/; // Check if the password is valid (at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character)
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,}$/; // Check if the username is valid (at least 3 characters, alphanumeric characters and underscores only)

/**
 * @function validateEmail - Validate an email address.
 * @param {string} email - The email address to validate.
 * @returns {boolean} - True if the email is valid, false otherwise.
 */
const validateEmail = (email) => {
  if (!email) {
    // Check if the email is empty
    return false;
  } else if (email.length > 254) {
    // Check if the email is too long
    return false;
  } else {
    // Check if the email matches the regex pattern
    return EMAIL_REGEX.test(email);
  }
};

/**
 * @function validatePassword - Validate a password.
 * @param {string} password - The password to validate.
 * @returns {boolean} - True if the password is valid, false otherwise.
 */
const validatePassword = (password) => {
  if (!password) {
    // Check if the password is empty
    return false;
  } else {
    // Check if the password matches the regex pattern
    return PASSWORD_REGEX.test(password);
  }
};

/**
 * @function validateUsername - Validate a username.
 * @param {string} username - The username to validate.
 * @returns {boolean} - True if the username is valid, false otherwise.
 */
const validateUsername = (username) => {
  if (!username) {
    // Check if the username is empty
    return false;
  } else {
    // Check if the username matches the regex pattern
    return USERNAME_REGEX.test(username);
  }
};

/**
 * @function validateIdentifier - Validate an identifier. (email or username)
 * @param {string} identifier - The identifier to validate.
 * @returns {boolean} - True if the identifier is valid, false otherwise.
 */
const validateIdentifier = (identifier) => {
  return validateEmail(identifier) || validateUsername(identifier);
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validateIdentifier,
};
