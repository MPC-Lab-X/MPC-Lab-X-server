/**
 * @file src/models/userSchema.js
 * @description User schema for the database.
 */

const mongoose = require("mongoose");

// Define the safety record schema
const safetyRecordSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    device: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

// Define the user schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    safetyRecords: [safetyRecordSchema],
  },
  {
    timestamps: true,
  }
);

// Index the user schema by username and email
userSchema.index({ username: 1, email: 1 });

// Create the user model
const User = mongoose.model("User", userSchema);

module.exports = User;
