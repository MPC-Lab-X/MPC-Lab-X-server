/**
 * @file src/models/classSchema.js
 * @description Class schema for the database.
 */

const mongoose = require("mongoose");

// Define the student schema
const studentSchema = new mongoose.Schema(
  {
    studentNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

// Define the class schema
const classSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    students: [studentSchema],
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

// Add a pre-save hook to the class schema to generate a random class code
classSchema.pre("save", function (next) {
  if (this.isNew) {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this._id = code;
  }
  next();
});

// Create the class model
const Class = mongoose.model("Class", classSchema);

module.exports = Class;
