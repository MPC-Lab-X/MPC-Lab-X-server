/**
 * @file src/controllers/taskController.js
 * @description Task controller for handling task operations.
 */

const taskService = require("../services/taskService");
const classService = require("../services/classService");

const ProblemGenerator = require("../problem-generators");
const problemGenerator = new ProblemGenerator();

const validationUtils = require("../utils/validationUtils");

/**
 * @function createTask - Create a new task.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const createTask = async (req, res) => {
  const userId = req.user.userId;
  const { classId, name, description, options } = req.body;

  // Check if class ID is valid
  if (!validationUtils.validateClassCode(classId)) {
    return res.badRequest("Invalid class ID.", "INVALID_CLASS_ID");
  }

  // Check if name is valid
  if (!validationUtils.validateTaskName(name)) {
    return res.badRequest("Invalid task name.", "INVALID_TASK_NAME");
  }

  // Check if description is valid
  if (!validationUtils.validateTaskDescription(description)) {
    return res.badRequest(
      "Invalid task description.",
      "INVALID_TASK_DESCRIPTION"
    );
  }

  // Check if options is present
  if (!options) {
    return res.badRequest("Options are required.", "OPTIONS_REQUIRED");
  }

  // Generate problems based on options
  const generateProblems = async (students, options) => {
    const studentNumbers = students
      .filter((student) => !student.deleted)
      .map((student) => student.studentNumber);

    if (options.isIndividualTask) {
      delete options.isIndividualTask;

      return await Promise.all(
        studentNumbers.map(async (studentNumber) => {
          const problems = problemGenerator.generate(options);
          return { studentNumber, problems };
        })
      );
    } else {
      delete options.isIndividualTask;

      const problems = problemGenerator.generate(options);
      return studentNumbers.map((studentNumber) => ({
        studentNumber,
        problems,
      }));
    }
  };

  // Create task with generated problems
  const createTask = async ({ classId, name, description, userTasks }) => {
    return await taskService.createTask({
      classId,
      name,
      description,
      userTasks,
    });
  };

  try {
    const classData = await classService.getClass(classId);
    if (!classData) {
      return res.notFound("Class not found.", "CLASS_NOT_FOUND");
    }

    // Check if teacher is the class teacher
    if (
      classData.teacher.toString() !== userId &&
      !classData.admins.includes(userId)
    ) {
      return res.forbidden(
        "You are not authorized to create task.",
        "ACCESS_DENIED"
      );
    }

    const generatedProblems = await generateProblems(
      classData.students,
      options
    );
    const task = await createTask({
      classId,
      name,
      description,
      userTasks: generatedProblems,
    });

    return res.success({ taskId: task._id }, "Task created successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error in creating task.",
      "TASK_CREATION_ERROR"
    );
  }
};

/**
 * @function getTasks - Get all tasks for a class.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const getTasks = async (req, res) => {
  const userId = req.user.userId;
  const { classId } = req.params;

  try {
    const classData = await classService.getClass(classId);
    if (!classData) {
      return res.notFound("Class not found.", "CLASS_NOT_FOUND");
    }

    // Check if teacher is the class teacher
    if (
      classData.teacher.toString() !== userId &&
      !classData.admins.includes(userId)
    ) {
      return res.forbidden(
        "You are not authorized to get tasks.",
        "ACCESS_DENIED"
      );
    }

    const tasks = await taskService.getTasks(classId);

    return res.success(tasks, "Tasks retrieved successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error in retrieving tasks.",
      "TASKS_RETRIEVAL_ERROR"
    );
  }
};

/**
 * @function getTask - Get a task by ID.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const getTask = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    const task = await taskService.getTask(id);

    if (!task) {
      return res.notFound("Task not found.", "TASK_NOT_FOUND");
    }

    const classData = await classService.getClass(task.classId);
    if (!classData) {
      return res.notFound("Class not found.", "CLASS_NOT_FOUND");
    }

    // Check if teacher is the class teacher
    if (
      classData.teacher.toString() !== userId &&
      !classData.admins.includes(userId)
    ) {
      return res.forbidden(
        "You are not authorized to get task.",
        "ACCESS_DENIED"
      );
    }

    return res.success(task, "Task retrieved successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error in retrieving task.",
      "TASK_RETRIEVAL_ERROR"
    );
  }
};

/**
 * @function getTaskProblems - Get the problems for a task.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const getTaskProblems = async (req, res) => {
  const userId = req.user.userId;
  const { id, studentNumber } = req.params;

  try {
    const task = await taskService.getTaskProblems(id, studentNumber);

    if (!task) {
      return res.notFound("Problems not found.", "PROBLEMS_NOT_FOUND");
    }

    const classData = await classService.getClass(task.classId);
    if (!classData) {
      return res.notFound("Class not found.", "CLASS_NOT_FOUND");
    }

    // Check if teacher is the class teacher
    if (
      classData.teacher.toString() !== userId &&
      !classData.admins.includes(userId)
    ) {
      return res.forbidden(
        "You are not authorized to get problems.",
        "ACCESS_DENIED"
      );
    }

    return res.success(task, "Problems retrieved successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error in retrieving problems.",
      "PROBLEMS_RETRIEVAL_ERROR"
    );
  }
};

/**
 * @function updateGradingStatus - Update the grading status of a task.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const updateGradingStatus = async (req, res) => {
  const userId = req.user.userId;
  const { id, studentNumber } = req.params;
  const { graded } = req.body;

  // Check if graded is valid
  if (typeof graded !== "boolean") {
    return res.badRequest("Invalid graded status.", "INVALID_GRADED_STATUS");
  }

  try {
    const taskData = await taskService.getTask(id);
    if (!taskData) {
      return res.notFound("Task not found.", "TASK_NOT_FOUND");
    }

    const classData = await classService.getClass(taskData.classId);
    if (!classData) {
      return res.notFound("Class not found.", "CLASS_NOT_FOUND");
    }

    // Check if teacher is the class teacher
    if (
      classData.teacher.toString() !== userId &&
      !classData.admins.includes(userId)
    ) {
      return res.forbidden(
        "You are not authorized to update grading status.",
        "ACCESS_DENIED"
      );
    }

    const task = await taskService.updateGradingStatus(
      id,
      studentNumber,
      graded
    );

    return res.success(task, "Task grading status updated successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error in updating grading status.",
      "GRADING_STATUS_UPDATE_ERROR"
    );
  }
};

/**
 * @function renameTask - Rename a task.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const renameTask = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const { name } = req.body;

  // Check if name is valid
  if (!validationUtils.validateTaskName(name)) {
    return res.badRequest("Invalid task name.", "INVALID_TASK_NAME");
  }

  try {
    const taskData = await taskService.getTask(id);
    if (!taskData) {
      return res.notFound("Task not found.", "TASK_NOT_FOUND");
    }

    const classData = await classService.getClass(taskData.classId);
    if (!classData) {
      return res.notFound("Class not found.", "CLASS_NOT_FOUND");
    }

    // Check if teacher is the class teacher
    if (
      classData.teacher.toString() !== userId &&
      !classData.admins.includes(userId)
    ) {
      return res.forbidden(
        "You are not authorized to rename task.",
        "ACCESS_DENIED"
      );
    }

    const task = await taskService.updateTaskName(id, name);

    if (!task) {
      return res.notFound("Task not found.", "TASK_NOT_FOUND");
    }

    return res.success(task, "Task renamed successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error in renaming task.",
      "TASK_RENAME_ERROR"
    );
  }
};

/**
 * @function updateDescription - Update the description of a task.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const updateDescription = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const { description } = req.body;

  // Check if description is valid
  if (!validationUtils.validateTaskDescription(description)) {
    return res.badRequest(
      "Invalid task description.",
      "INVALID_TASK_DESCRIPTION"
    );
  }

  try {
    const taskData = await taskService.getTask(id);
    if (!taskData) {
      return res.notFound("Task not found.", "TASK_NOT_FOUND");
    }

    const classData = await classService.getClass(taskData.classId);
    if (!classData) {
      return res.notFound("Class not found.", "CLASS_NOT_FOUND");
    }

    // Check if teacher is the class teacher
    if (
      classData.teacher.toString() !== userId &&
      !classData.admins.includes(userId)
    ) {
      return res.forbidden(
        "You are not authorized to update task description.",
        "ACCESS_DENIED"
      );
    }

    const task = await taskService.updateTaskDescription(id, description);

    if (!task) {
      return res.notFound("Task not found.", "TASK_NOT_FOUND");
    }

    return res.success(task, "Task description updated successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error in updating task description.",
      "TASK_DESCRIPTION_UPDATE_ERROR"
    );
  }
};

/**
 * @function deleteTask - Delete a task.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const deleteTask = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    const taskData = await taskService.getTask(id);
    if (!taskData) {
      return res.notFound("Task not found.", "TASK_NOT_FOUND");
    }

    const classData = await classService.getClass(taskData.classId);
    if (!classData) {
      return res.notFound("Class not found.", "CLASS_NOT_FOUND");
    }

    // Check if teacher is the class teacher
    if (
      classData.teacher.toString() !== userId &&
      !classData.admins.includes(userId)
    ) {
      return res.forbidden(
        "You are not authorized to delete task.",
        "ACCESS_DENIED"
      );
    }

    const task = await taskService.deleteTask(id);

    if (!task) {
      return res.notFound("Task not found.", "TASK_NOT_FOUND");
    }

    return res.success(task, "Task deleted successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error in deleting task.",
      "TASK_DELETION_ERROR"
    );
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  getTaskProblems,
  updateGradingStatus,
  renameTask,
  updateDescription,
  deleteTask,
};
