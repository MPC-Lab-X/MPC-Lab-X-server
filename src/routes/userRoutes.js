/**
 * @file src/routes/userRoutes.js
 * @description Routes for user operations.
 */

const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.get("/:id", userController.getUser);

module.exports = router;
