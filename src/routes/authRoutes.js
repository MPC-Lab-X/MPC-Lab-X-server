/**
 * @file src/routes/authRoutes.js
 * @description Routes for user authentication.
 */

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

router.post("/register", authController.registerUser);
router.post("/complete-registration", authController.completeRegistration);

router.post("/login", authController.loginUser);
router.post("/refresh-token", authController.refreshToken);

module.exports = router;
