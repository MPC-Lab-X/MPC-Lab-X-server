/**
 * @file src/models/taskSchema.js
 * @description Task schema for the database.
 */

const mongoose = require("mongoose");

// Define the problem schema
const userTaskSchema = new mongoose.Schema(
  {
    studentNumber: {
      type: Number,
      required: true,
    },
    problems: [
      {
        type: String,
        required: true,
        default: "[]",
        select: false,
      },
    ],
    graded: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

// Define the task schema
const taskSchema = new mongoose.Schema(
  {
    classId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    userTasks: [userTaskSchema],
  },
  {
    timestamps: true,
  }
);

// Index the classId field
taskSchema.index({ classId: 1 });

// Create the task model
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
