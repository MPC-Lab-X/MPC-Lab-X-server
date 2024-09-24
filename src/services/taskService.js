/**
 * @file src/services/taskService.js
 * @description Task service for interacting with the database.
 */

const mongoose = require("mongoose");
const Task = require("../models/taskSchema");

/**
 * @function createTask - Create a new task.
 * @param {Object} taskData - The task data to create.
 * @returns {Promise<Object>} The created task object.
 * @throws {Error} Throws an error if the task fails to create.
 */
const createTask = async (taskData) => {
  try {
    const newTask = new Task(taskData);
    const savedTask = await newTask.save();
    return savedTask;
  } catch (error) {
    console.error("Error in creating task: ", error);
    throw error;
  }
};

/**
 * @function getTasks - Get all tasks for a class.
 * @param {string} classId - The class ID.
 * @returns {Promise<Array>} The tasks array.
 * @throws {Error} Throws an error if the tasks fail to retrieve.
 */
const getTasks = async (classId) => {
  try {
    const tasks = await Task.find({ classId });
    return tasks;
  } catch (error) {
    console.error("Error in getting tasks: ", error);
    throw error;
  }
};

/**
 * @function getTask - Get a task by ID.
 * @param {string} taskId - The task ID.
 * @returns {Promise<Object>} The task object.
 * @throws {Error} Throws an error if the task fails to retrieve.
 */
const getTask = async (taskId) => {
  if (!mongoose.isValidObjectId(taskId)) return null;

  try {
    const task = await Task.findById(taskId);
    return task;
  } catch (error) {
    console.error("Error in getting task: ", error);
    throw error;
  }
};

/**
 * @function getTaskProblems - Get the problems for a task.
 * @param {string} taskId - The task ID.
 * @param {number} studentNumber - The student number.
 * @returns {Promise<Array>} The problems array.
 * @throws {Error} Throws an error if the problems fail to retrieve.
 */
const getTaskProblems = async (taskId, studentNumber) => {
  if (!mongoose.isValidObjectId(taskId)) return null;

  try {
    const task = await Task.findById(taskId).select(
      "userTasks.studentNumber userTasks.problems"
    );

    if (!task) throw new Error("Task not found");

    const userTask = task.userTasks.find(
      (task) => task.studentNumber === studentNumber
    );

    if (!userTask) throw new Error("User task not found");

    return userTask.problems;
  } catch (error) {
    throw error;
  }
};

/**
 * @function updateGradingStatus - Update the grading status of a task.
 * @param {string} taskId - The task ID.
 * @param {number} studentNumber - The student number.
 * @param {boolean} graded - The grading status.
 * @returns {Promise<Object>} The updated task object.
 */
const updateGradingStatus = async (taskId, studentNumber, graded) => {
  if (!mongoose.isValidObjectId(taskId)) return null;

  try {
    const task = await Task.findById(taskId);

    if (!task) throw new Error("Task not found");

    const userTask = task.userTasks.find(
      (task) => task.studentNumber === studentNumber
    );

    if (!userTask) throw new Error("User task not found");

    userTask.graded = graded;
    const updatedTask = await task.save();

    return updatedTask;
  } catch (error) {
    throw error;
  }
};

/**
 * @function updateTaskName - Update the name of a task.
 * @param {string} taskId - The task ID.
 * @param {string} name - The new task name.
 * @returns {Promise<Object>} The updated task object.
 * @throws {Error} Throws an error if the task fails to update.
 */
const updateTaskName = async (taskId, name) => {
  if (!mongoose.isValidObjectId(taskId)) return null;

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { name },
      { new: true }
    );

    if (!updatedTask) {
      throw new Error("Task not found");
    }

    return updatedTask;
  } catch (error) {
    throw error;
  }
};

/**
 * @function updateTaskDescription - Update the description of a task.
 * @param {string} taskId - The task ID.
 * @param {string} description - The new task description.
 * @returns {Promise<Object>} The updated task object.
 * @throws {Error} Throws an error if the task fails to update.
 */
const updateTaskDescription = async (taskId, description) => {
  if (!mongoose.isValidObjectId(taskId)) return null;

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { description },
      { new: true }
    );

    if (!updatedTask) {
      throw new Error("Task not found");
    }

    return updatedTask;
  } catch (error) {
    throw error;
  }
};

/**
 * @function deleteTask - Delete a task.
 * @param {string} taskId - The task ID.
 * @returns {Promise<Object>} The deleted task object.
 * @throws {Error} Throws an error if the task fails to delete.
 */
const deleteTask = async (taskId) => {
  if (!mongoose.isValidObjectId(taskId)) return null;

  try {
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      throw new Error("Task not found");
    }

    return deletedTask;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  getTaskProblems,
  updateGradingStatus,
  updateTaskName,
  updateTaskDescription,
  deleteTask,
};
