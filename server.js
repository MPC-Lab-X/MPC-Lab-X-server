/**
 * @file server.js
 * @description Server configuration and initialization.
 */

// Load environment variables from .env file
require("dotenv").config();

// Load required modules
const express = require("express");
const bodyParser = require("body-parser");
const preprocessRequestDetailsMiddleware = require("./src/middlewares/preprocessRequestDetailsMiddleware");
const responseMiddleware = require("./src/middlewares/responseMiddleware");
const authMiddleware = require("./src/middlewares/authMiddleware");
const connectDB = require("./src/db/db");
const routes = require("./src/routes/index");

const port = process.env.PORT || 5000;
const host = process.env.HOST || "localhost";

const app = express();

// Trust the first proxy
app.set("trust proxy", 1);

// Connect to the database
connectDB();

// Middleware setup
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(preprocessRequestDetailsMiddleware);
app.use(responseMiddleware);
app.use(authMiddleware);

// Routes setup
app.use("/api", routes);

// Start the server
app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
