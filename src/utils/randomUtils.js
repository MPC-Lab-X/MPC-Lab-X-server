/**
 * @file src/utils/randomUtils.js
 * @description Random utility functions.
 */

/**
 * @function randomInt - Generate a random integer between min and max (inclusive).
 * @param {number} min - The minimum value (inclusive).
 * @param {number} max - The maximum value (inclusive).
 * @returns {number} - A random integer between min and max.
 */
const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * @function randomVariable - Generate a random variable. (a-z)
 * @param {boolean} isUpperCase - Whether the variable should be uppercase. (A-Z)
 * @returns {string} - A random variable.
 */
const randomVariable = (isUpperCase = false) => {
  const min = isUpperCase ? 65 : 97;
  const max = isUpperCase ? 90 : 122;
  return String.fromCharCode(randomInt(min, max));
};

/**
 * @function randomElement - Get a random element from an array.
 * @param {Array} array - The array to get a random element from.
 * @returns {*} - A random element from the array.
 */
const randomElement = (array) => {
  return array[randomInt(0, array.length - 1)];
};

module.exports = { randomInt, randomVariable, randomElement };
