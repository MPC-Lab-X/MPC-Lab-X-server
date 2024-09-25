/**
 * @file tests/jest.config.js
 * @description Jest configuration.
 */

module.exports = {
  setupFilesAfterEnv: ["<rootDir>/setup.js"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
  testMatch: ["<rootDir>/**/*.test.js"],
  maxWorkers: 1,
};
