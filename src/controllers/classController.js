/**
 * @file src/controllers/classController.js
 * @description Class controller for handling class operations.
 */

const classService = require("../services/classService");
const userService = require("../services/userService");

const validationUtils = require("../utils/validationUtils");

/**
 * @function createClass - Create a new class.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const createClass = async (req, res) => {
  const teacherId = req.user.userId;
  const { className } = req.body;

  // Check if class name is valid
  if (!validationUtils.validateClassName(className)) {
    return res.badRequest("Invalid class name.", "INVALID_CLASS_NAME");
  }

  // Create class
  try {
    const newClass = await classService.createClass({
      name: className,
      teacher: teacherId,
    });
    return res.success(newClass, "Class created successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error creating class.",
      "CREATE_CLASS_ERROR"
    );
  }
};

/**
 * @function deleteClass - Delete a class by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const deleteClass = async (req, res) => {
  const teacherId = req.user.userId;
  const { id } = req.params;

  // Check if class ID is valid
  if (!validationUtils.validateClassCode(id)) {
    return res.badRequest("Invalid class ID.", "INVALID_CLASS_ID");
  }

  // Get class by ID
  try {
    const classData = await classService.getClass(id);
    if (!classData) {
      return res.notFound("Class not found.", "CLASS_NOT_FOUND");
    }

    // Check if teacher is the class teacher
    if (classData.teacher._id.toString() !== teacherId) {
      return res.forbidden(
        "You are not authorized to delete this class.",
        "ACCESS_DENIED"
      );
    }

    // Delete class
    const deletedClass = await classService.deleteClass(id);
    if (deletedClass) {
      return res.success(null, "Class deleted successfully.");
    } else {
      return res.notFound("Class not found.", "CLASS_NOT_FOUND");
    }
  } catch (error) {
    return res.internalServerError(
      "Error deleting class.",
      "DELETE_CLASS_ERROR"
    );
  }
};

/**
 * @function renameClass - Rename a class by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const renameClass = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const { name } = req.body;

  // Check if class ID is valid
  if (!validationUtils.validateClassCode(id)) {
    return res.badRequest("Invalid class ID.", "INVALID_CLASS_ID");
  }

  // Check if class name is valid
  if (!validationUtils.validateClassName(name)) {
    return res.badRequest("Invalid class name.", "INVALID_CLASS_NAME");
  }

  // Get class by ID
  try {
    const classData = await classService.getClass(id);
    if (!classData) {
      return res.notFound("Class not found.", "CLASS_NOT_FOUND");
    }

    // Check if user is the class teacher or admin
    if (
      classData.teacher._id.toString() !== userId &&
      !classData.admins.some((admin) => admin._id.toString() === userId)
    ) {
      return res.forbidden(
        "You are not authorized to rename this class.",
        "ACCESS_DENIED"
      );
    }

    // Rename class
    const updatedClass = await classService.renameClass(id, name);
    return res.success(updatedClass, "Class renamed successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error renaming class.",
      "RENAME_CLASS_ERROR"
    );
  }
};

/**
 * @function getClasses - Get all classes by user ID (teacher or admin).
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const getClasses = async (req, res) => {
  const userId = req.user.userId;

  // Get classes by user ID
  try {
    const classes = await classService.getClasses(userId);
    return res.success(classes, "Classes retrieved successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error getting classes.",
      "GET_CLASSES_ERROR"
    );
  }
};

/**
 * @function getClass - Get a class by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const getClass = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  // Check if class ID is valid
  if (!validationUtils.validateClassCode(id)) {
    return res.badRequest("Invalid class ID.", "INVALID_CLASS_ID");
  }

  // Get class by ID
  try {
    const classData = await classService.getClass(id);
    if (!classData) {
      return res.notFound("Class not found.", "CLASS_NOT_FOUND");
    }

    // Check if user is the class teacher or admin
    if (
      classData.teacher._id.toString() !== userId &&
      !classData.admins.some((admin) => admin._id.toString() === userId)
    ) {
      return res.forbidden(
        "You are not authorized to view this class.",
        "ACCESS_DENIED"
      );
    }

    return res.success(classData, "Class retrieved successfully.");
  } catch (error) {
    return res.internalServerError("Error getting class.", "GET_CLASS_ERROR");
  }
};

/**
 * @function addAdmin - Add an admin to a class by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const addAdmin = async (req, res) => {
  const teacherId = req.user.userId;
  const { id } = req.params;
  const { userId } = req.body;

  // Check if class ID is valid
  if (!validationUtils.validateClassCode(id)) {
    return res.badRequest("Invalid class ID.", "INVALID_CLASS_ID");
  }

  // Check if user ID is valid
  const user = await userService.getUserById(userId);
  if (!user) {
    return res.notFound("User not found.", "USER_NOT_FOUND");
  }

  // Get class by ID
  try {
    const classData = await classService.getClass(id);
    if (!classData) {
      return res.notFound("Class not found.", "CLASS_NOT_FOUND");
    }

    // Check if teacher is the class teacher
    if (classData.teacher._id.toString() !== teacherId) {
      return res.forbidden(
        "You are not authorized to add an admin to this class.",
        "ACCESS_DENIED"
      );
    }

    // Add admin to class
    const updatedClass = await classService.addAdmin(id, userId);
    return res.success(updatedClass, "Admin added successfully.");
  } catch (error) {
    return res.internalServerError("Error adding admin.", "ADD_ADMIN_ERROR");
  }
};

/**
 * @function removeAdmin - Remove an admin from a class by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const removeAdmin = async (req, res) => {
  const teacherId = req.user.userId;
  const { id } = req.params;
  const { userId } = req.body;

  // Check if class ID is valid
  if (!validationUtils.validateClassCode(id)) {
    return res.badRequest("Invalid class ID.", "INVALID_CLASS_ID");
  }

  // Check if user ID is valid
  const user = await userService.getUserById(userId);
  if (!user) {
    return res.notFound("User not found.", "USER_NOT_FOUND");
  }

  // Get class by ID
  try {
    const classData = await classService.getClass(id);
    if (!classData) {
      return res.notFound("Class not found.", "CLASS_NOT_FOUND");
    }

    // Check if teacher is the class teacher
    if (classData.teacher._id.toString() !== teacherId) {
      return res.forbidden(
        "You are not authorized to remove an admin from this class.",
        "ACCESS_DENIED"
      );
    }

    // Remove admin from class
    const updatedClass = await classService.removeAdmin(id, userId);
    return res.success(updatedClass, "Admin removed successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error removing admin.",
      "REMOVE_ADMIN_ERROR"
    );
  }
};

/**
 * @function addStudent - Add a student to a class by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const addStudent = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const { name } = req.body;

  // Check if class ID is valid
  if (!validationUtils.validateClassCode(id)) {
    return res.badRequest("Invalid class ID.", "INVALID_CLASS_ID");
  }

  // Check if student name is valid
  if (!validationUtils.validateStudentName(name)) {
    return res.badRequest("Invalid student name.", "INVALID_STUDENT_NAME");
  }

  // Get class by ID
  try {
    const classData = await classService.getClass(id);
    if (!classData) {
      return res.notFound("Class not found.", "CLASS_NOT_FOUND");
    }

    // Check if teacher is the class teacher or admin
    if (
      classData.teacher._id.toString() !== userId &&
      !classData.admins.some((admin) => admin._id.toString() === userId)
    ) {
      return res.forbidden(
        "You are not authorized to add a student to this class.",
        "ACCESS_DENIED"
      );
    }

    // Add student to class
    const updatedClass = await classService.addStudent(id, name);
    return res.success(updatedClass, "Student added successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error adding student.",
      "ADD_STUDENT_ERROR"
    );
  }
};

/**
 * @function renameStudent - Rename a student in a class by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const renameStudent = async (req, res) => {
  const userId = req.user.userId;
  const { id, studentNumber } = req.params;
  const { name } = req.body;

  // Check if class ID is valid
  if (!validationUtils.validateClassCode(id)) {
    return res.badRequest("Invalid class ID.", "INVALID_CLASS_ID");
  }

  // Check if student number is valid
  if (!validationUtils.validateStudentNumber(studentNumber)) {
    return res.badRequest("Invalid student number.", "INVALID_STUDENT_NUMBER");
  }

  // Check if student name is valid
  if (!validationUtils.validateStudentName(name)) {
    return res.badRequest("Invalid student name.", "INVALID_STUDENT_NAME");
  }

  // Get class by ID
  try {
    const classData = await classService.getClass(id);
    if (!classData) {
      return res.notFound("Class not found.", "CLASS_NOT_FOUND");
    }

    // Check if teacher is the class teacher
    if (
      classData.teacher._id.toString() !== userId &&
      !classData.admins.some((admin) => admin._id.toString() === userId)
    ) {
      return res.forbidden(
        "You are not authorized to rename a student in this class.",
        "ACCESS_DENIED"
      );
    }

    // Rename student in class
    const updatedClass = await classService.renameStudent(
      id,
      parseInt(studentNumber),
      name
    );
    return res.success(updatedClass, "Student renamed successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error renaming student.",
      "RENAME_STUDENT_ERROR"
    );
  }
};

/**
 * @function deleteStudent - Delete a student from a class by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const deleteStudent = async (req, res) => {
  const userId = req.user.userId;
  const { id, studentNumber } = req.params;

  // Check if class ID is valid
  if (!validationUtils.validateClassCode(id)) {
    return res.badRequest("Invalid class ID.", "INVALID_CLASS_ID");
  }

  // Check if student number is valid
  if (!validationUtils.validateStudentNumber(studentNumber)) {
    return res.badRequest("Invalid student number.", "INVALID_STUDENT_NUMBER");
  }

  // Get class by ID
  try {
    const classData = await classService.getClass(id);
    if (!classData) {
      return res.notFound("Class not found.", "CLASS_NOT_FOUND");
    }

    // Check if teacher is the class teacher or admin
    if (
      classData.teacher._id.toString() !== userId &&
      !classData.admins.some((admin) => admin._id.toString() === userId)
    ) {
      return res.forbidden(
        "You are not authorized to delete a student from this class.",
        "ACCESS_DENIED"
      );
    }

    // Delete student from class
    const updatedClass = await classService.deleteStudent(
      id,
      parseInt(studentNumber)
    );
    return res.success(updatedClass, "Student deleted successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error deleting student.",
      "DELETE_STUDENT_ERROR"
    );
  }
};

module.exports = {
  createClass,
  deleteClass,
  renameClass,
  getClasses,
  getClass,
  addAdmin,
  removeAdmin,
  addStudent,
  renameStudent,
  deleteStudent,
};
