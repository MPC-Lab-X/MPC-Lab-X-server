/**
 * @file src/routes/index.js
 * @description Routes for the API.
 */

const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const classRoutes = require("./classRoutes");
const taskRoutes = require("./taskRoutes");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/classes", classRoutes);
router.use("/tasks", taskRoutes);

router.get("*", (req, res) => {
  res.notFound();
});

module.exports = router;
