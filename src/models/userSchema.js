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
      enum: [
        "LOGIN_SUCCESS",
        "LOGIN_FAILED",
        "PASSWORD_RESET_REQUESTED",
        "PASSWORD_RESET_SUCCESS",
        "EMAIL_CHANGED",
        "PASSWORD_CHANGED",
        "ACCOUNT_CREATED",
        "ACCOUNT_LOCKED",
        "ACCOUNT_UNLOCKED",
      ],
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
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true,
      default: function () {
        return this.username;
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    locked: {
      type: Boolean,
      required: true,
      default: false,
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

// Delete the password field when converting to JSON
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

// Create the user model
const User = mongoose.model("User", userSchema);

module.exports = User;
