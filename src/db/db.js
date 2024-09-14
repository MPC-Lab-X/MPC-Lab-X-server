/**
 * @file db/db.js
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

module.exports = connectDB;
