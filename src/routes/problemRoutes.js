/**
 * @file src/routes/problemRoutes.js
 * @description Routes for problem generation.
 */

const express = require("express");
const router = express.Router();

const rateLimiter = require("../utils/rateLimiter");

const problemController = require("../controllers/problemController");

router.get("/", rateLimiter(), problemController.getIndex);

router.get(
  "/*",
  rateLimiter(100, 5 * 60 * 1000),
  problemController.generateProblem
);

module.exports = router;
