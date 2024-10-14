/**
 * @file src/routes/taskRoutes.js
 * @description Routes for task management.
 */

const express = require("express");
const router = express.Router();

const rateLimiter = require("../utils/rateLimiter");

const taskController = require("../controllers/taskController");

router.use(rateLimiter());

router.get("/:id", taskController.getTask);
router.delete("/:id", taskController.deleteTask);

router.get("/:id/problems/:studentNumber", taskController.getTaskProblems);

router.put("/:id/name", taskController.renameTask);
router.put("/:id/description", taskController.updateDescription);

router.put("/:id/grade/:studentNumber", taskController.updateGradingStatus);

module.exports = router;
