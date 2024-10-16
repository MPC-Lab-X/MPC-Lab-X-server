/**
 * @file src/routes/classRoutes.js
 * @description Routes for class management.
 */

const express = require("express");
const router = express.Router();

const rateLimiter = require("../utils/rateLimiter");

const classController = require("../controllers/classController");
const taskController = require("../controllers/taskController");

router.use(rateLimiter());

router.post("/", classController.createClass);
router.delete("/:id", classController.deleteClass);
router.put("/:id/name", classController.renameClass);

router.get("/", classController.getClasses);
router.get("/:id", classController.getClass);

router.post("/:classId/tasks", taskController.createTask);
router.get("/:classId/tasks", taskController.getTasks);

router.post("/:id/admins", classController.addAdmin);
router.delete("/:id/admins", classController.removeAdmin);

router.post("/:id/students", classController.addStudent);
router.put("/:id/students/:studentNumber", classController.renameStudent);
router.delete("/:id/students/:studentNumber", classController.deleteStudent);

module.exports = router;
