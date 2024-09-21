/**
 * @file src/routes/classRoutes.js
 * @description Routes for class management.
 */

const express = require("express");
const router = express.Router();

const classController = require("../controllers/classController");

router.post("/", classController.createClass);
router.delete("/:id", classController.deleteClass);
router.put("/:id/name", classController.renameClass);

router.get("/:id", classController.getClass);

router.put("/:id/admins", classController.addAdmin);
router.delete("/:id/admins", classController.removeAdmin);

router.put("/:id/students", classController.addStudent);
router.put("/:id/students/:studentNumber", classController.renameStudent);
router.delete("/:id/students/:studentNumber", classController.deleteStudent);

module.exports = router;