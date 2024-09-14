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
      select: false, // Do not return the password by default
    },
    refreshToken: {
      type: String,
      required: false,
    },
    safetyRecords: {
      type: [safetyRecordSchema],
      required: false,
      default: [],
      select: false, // Do not return the safety records by default
    },
  },
  {
    timestamps: true,
  }
);

// Index the username field
userSchema.index({ username: 1 }, { unique: true });

// Index the email field
userSchema.index({ email: 1 }, { unique: true });

// Create the user model
const User = mongoose.model("User", userSchema);

module.exports = User;
