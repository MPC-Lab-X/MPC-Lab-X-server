/**
 * @file src/routes/userRoutes.js
 * @description Routes for user operations.
 */

const express = require("express");
const router = express.Router();

const rateLimiter = require("../utils/rateLimiter");

const userController = require("../controllers/userController");

router.use(rateLimiter());

router.get("/:id", userController.getUser);

router.get("/:id/safety-records", userController.getSafetyRecords);

router.put("/:id/username", userController.updateUsername);
router.put("/:id/display-name", userController.updateDisplayName);
router.put(
  "/:id/email",
  rateLimiter(3, 2 * 60 * 1000),
  userController.updateEmail
);
router.put("/:id/email/complete", userController.completeEmailUpdate);
router.put("/:id/password", userController.updatePassword);

module.exports = router;
