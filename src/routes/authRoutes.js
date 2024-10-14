/**
 * @file src/routes/authRoutes.js
 * @description Routes for user authentication.
 */

const express = require("express");
const router = express.Router();

const rateLimiter = require("../utils/rateLimiter");

const authController = require("../controllers/authController");

router.post(
  "/register",
  rateLimiter(3, 2 * 60 * 1000),
  authController.registerUser
);
router.post(
  "/complete-registration",
  rateLimiter(),
  authController.completeRegistration
);

router.post(
  "/login",
  rateLimiter(15, 60 * 60 * 1000),
  authController.loginUser
);
router.post("/refresh-token", rateLimiter(), authController.refreshToken);

router.post(
  "/reset-password",
  rateLimiter(3, 2 * 60 * 1000),
  authController.resetPassword
);
router.post(
  "/complete-reset-password",
  rateLimiter(),
  authController.completeResetPassword
);

module.exports = router;
