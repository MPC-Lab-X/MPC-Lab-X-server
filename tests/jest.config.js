/**
 * @file tests/jest.config.js
 * @description Jest configuration.
 */

module.exports = {
  setupFiles: ["<rootDir>/tests/setup.js"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
};
