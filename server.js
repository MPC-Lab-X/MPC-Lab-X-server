/**
 * @file server.js
 * @description Server configuration and initialization.
 */

// Load environment variables from .env file
require("dotenv").config();

// Load required modules
const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./src/db/db");
const port = process.env.PORT || 5000;
const host = process.env.HOST || "localhost";

const app = express();

// Connect to the database
connectDB();

app.use(express.static("public"));

app.use(bodyParser.json());

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
