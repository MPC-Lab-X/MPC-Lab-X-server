/**
 * @file src/problem-generators/index.js
 * @description This file to load index.json.
 */

const fs = require("fs");
const path = require("path");

const index = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "index.json"), "utf8")
);

module.exports = index;
