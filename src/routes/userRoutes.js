/**
 * @file src/routes/userRoutes.js
 * @description Routes for user operations.
 */

const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.get("/:id", userController.getUser);

router.put("/:id/username", userController.updateUsername);
router.put("/:id/email", userController.updateEmail);
router.put("/:id/email/complete", userController.completeEmailUpdate);
router.put("/:id/password", userController.updatePassword);

module.exports = router;
