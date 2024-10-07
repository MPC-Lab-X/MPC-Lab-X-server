/**
 * @file src/utils/validationUtils.js
 * @description Validation utility functions.
 */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Check if the email is valid (contains an @ symbol and a period)
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])[^\s]{8,}$/; // Check if the password is valid (at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character)
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,}$/; // Check if the username is valid (at least 3 characters, alphanumeric characters and underscores only)
const DISPLAY_NAME_REGEX = /^(?!.*\s{2,})[^\s](.{0,18}[^\s])?$|^$/; // Check if the display name is valid (no more than 20 characters, no leading or trailing spaces, no consecutive spaces)
const CLASS_CODE_REGEX = /^[A-Z0-9]{6}$/; // Check if the class code is valid (exactly 6 characters, uppercase letters and numbers only)
const CLASS_NAME_REGEX = /^(?!\s*$)[a-zA-Z0-9\s]{1,50}$/; // Check if the class name is valid (at least 1 character, alphanumeric characters and spaces only, cannot be empty or just spaces or symbols)
const STUDENT_NAME_REGEX = /^(?!.*\s{2,})[^\s](.{0,18}[^\s])?$|^$/; // Check if the student name is valid (no more than 20 characters, no leading or trailing spaces, no consecutive spaces)
const TASK_NAME_REGEX = /^(?!.*\s{2,})(?!\s)(.{2,50}?)(?<!\s)$/; // Check if the task name is valid (at least 3 characters, no more than 50 characters, no leading or trailing spaces, no consecutive spaces)
const TASK_DESCRIPTION_REGEX = /^(?!.*\s{2,})(?!\s)(.{0,500}?)(?<!\s)$/; // Check if the task description is valid (no more than 500 characters, no leading or trailing spaces, no consecutive spaces)

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
 * @function validateDisplayName - Validate a display name.
 * @param {string} displayName - The display name to validate.
 * @returns {boolean} - True if the display name is valid, false otherwise.
 */
const validateDisplayName = (displayName) => {
  if (displayName === undefined || displayName === null) {
    // Check if the display name is empty (null or undefined, but not an empty string)
    return false;
  } else {
    // Check if the display name matches the regex pattern
    return DISPLAY_NAME_REGEX.test(displayName);
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

/**
 * @function validateLimit - Validate a limit query parameter.
 * @param {string} limit - The limit query parameter to validate.
 * @returns {boolean} - True if the limit is valid, false otherwise.
 */
const validateLimit = (limit) => {
  return !isNaN(limit) && parseInt(limit) > 0 && parseInt(limit) <= 100;
};

/**
 * @function validateOffset - Validate an offset query parameter.
 * @param {string} offset - The offset query parameter to validate.
 * @returns {boolean} - True if the offset is valid, false otherwise.
 */
const validateOffset = (offset) => {
  return !isNaN(offset) && parseInt(offset) >= 0;
};

/**
 * @function validateClassCode - Validate a class code.
 * @param {string} classCode - The class code to validate.
 * @returns {boolean} - True if the class code is valid, false otherwise.
 */
const validateClassCode = (classCode) => {
  if (!classCode) {
    // Check if the class code is empty
    return false;
  } else {
    // Check if the class code matches the regex pattern
    return CLASS_CODE_REGEX.test(classCode);
  }
};

/**
 * @function validateClassName - Validate a class name.
 * @param {string} className - The class name to validate.
 * @returns {boolean} - True if the class name is valid, false otherwise.
 */
const validateClassName = (className) => {
  if (!className) {
    // Check if the class name is empty
    return false;
  } else {
    // Check if the class name matches the regex pattern
    return CLASS_NAME_REGEX.test(className);
  }
};

/**
 * @function validateStudentNumber - Validate a student number.
 * @param {number} studentNumber - The student number to validate.
 * @returns {boolean} - True if the student number is valid, false otherwise.
 */
const validateStudentNumber = (studentNumber) => {
  return !isNaN(studentNumber) && studentNumber > 0;
};

/**
 * @function validateStudentName - Validate a student name.
 * @param {string} studentName - The student name to validate.
 * @returns {boolean} - True if the student name is valid, false otherwise.
 */
const validateStudentName = (studentName) => {
  if (!studentName) {
    // Check if the student name is empty
    return false;
  } else {
    // Check if the student name matches the regex pattern
    return STUDENT_NAME_REGEX.test(studentName);
  }
};

/**
 * @function validateTaskName - Validate a task name.
 * @param {string} taskName - The task name to validate.
 * @returns {boolean} - True if the task name is valid, false otherwise.
 */
const validateTaskName = (taskName) => {
  if (!taskName) {
    // Check if the task name is empty
    return false;
  } else {
    // Check if the task name matches the regex pattern
    return TASK_NAME_REGEX.test(taskName);
  }
};

/**
 * @function validateTaskDescription - Validate a task description.
 * @param {string} taskDescription - The task description to validate.
 * @returns {boolean} - True if the task description is valid, false otherwise.
 */
const validateTaskDescription = (taskDescription) => {
  if (!taskDescription) {
    // Check if the task description is empty
    return false;
  } else {
    // Check if the task description matches the regex pattern
    return TASK_DESCRIPTION_REGEX.test(taskDescription);
  }
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validateDisplayName,
  validateIdentifier,
  validateLimit,
  validateOffset,
  validateClassCode,
  validateClassName,
  validateStudentNumber,
  validateStudentName,
  validateTaskName,
  validateTaskDescription,
};
