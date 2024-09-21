/**
 * @file src/routes/index.js
 * @description Routes for the API.
 */

const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const classRoutes = require("./classRoutes");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/classes", classRoutes);

router.get("*", (req, res) => {
  res.notFound();
});

module.exports = router;
