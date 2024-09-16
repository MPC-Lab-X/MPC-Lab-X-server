/**
 * @file src/db/db.js
 * @description Database connection and initialization.
 */

const mongoose = require("mongoose");

let isConnected = false;

/**
 * @function connectDB - Connect to the database.
 * @returns {Promise} - A promise that resolves when the connection is successful.
 * @throws {Error} - Throws an error if the connection fails.
 */
const connectDB = async () => {
  if (isConnected) {
    console.log("=> using existing database connection");
    return Promise.resolve();
  }

  console.log("=> using new database connection");
  const db = await mongoose.connect(process.env.MONGODB_URI);

  isConnected = db.connections[0].readyState;
};

/**
 * @function disconnectDB - Disconnect from the database.
 * @returns {Promise} - A promise that resolves when the disconnection is successful.
 * @throws {Error} - Throws an error if the disconnection fails.
 */
const disconnectDB = async () => {
  if (!isConnected) {
    console.log("=> no active database connection to close");
    return;
  }

  console.log("=> closing database connection");
  await mongoose.disconnect();
  isConnected = false;
};

module.exports = { connectDB, disconnectDB };
