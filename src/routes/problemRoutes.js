/**
 * @file src/routes/problemRoutes.js
 * @description Routes for problem generation.
 */

const express = require("express");
const router = express.Router();

const problemController = require("../controllers/problemController");

router.get("/", problemController.getIndex);

router.get("/*", problemController.generateProblem);

module.exports = router;
