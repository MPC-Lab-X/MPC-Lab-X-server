/**
 * @file src/routes/index.js
 * @description Routes for the API.
 */

const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");

router.use("/auth", authRoutes);

router.get("*", (req, res) => {
  res.notFound();
});

module.exports = router;