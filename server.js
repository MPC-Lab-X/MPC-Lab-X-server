/**
 * @file server.js
 * @description Server configuration and initialization.
 */

// Load environment variables from .env file
require("dotenv").config();

// Load required modules
const express = require("express");
const bodyParser = require("body-parser");
const responseMiddleware = require("./src/middlewares/responseMiddleware");
const authMiddleware = require("./src/middlewares/authMiddleware");
const connectDB = require("./src/db/db");
const routes = require("./src/routes/index");
const port = process.env.PORT || 5000;
const host = process.env.HOST || "localhost";

const app = express();

// Connect to the database
connectDB();

app.use(express.static("public"));

app.use(bodyParser.json());

app.use(responseMiddleware);

app.use(authMiddleware);

app.use("/api", routes);

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
