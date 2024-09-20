/**
 * @file src/services/classService.js
 * @description Class service for interacting with the database.
 */

const mongoose = require("mongoose");
const Class = require("../models/classSchema");

/**
 * @function createClass - Create a new class.
 * @param {Object} classData - The class data to create.
 * @returns {Promise<Object>} The created class object.
 * @throws {Error} Throws an error if the class fails to create.
 */
const createClass = async (classData) => {
  try {
    const newClass = new Class(classData);
    const savedClass = await newClass.save();
    return savedClass;
  } catch (error) {
    console.error("Error in creating class: ", error);
    throw error;
  }
};

/**
 * @function getClass - Get a class by ID.
 * @param {string} classId - The class ID.
 * @returns {Promise<Object>} The class object.
 * @throws {Error} Throws an error if the class fails to retrieve.
 */
const getClass = async (classId) => {
  try {
    const classData = await Class.findById(classId);
    return classData;
  } catch (error) {
    console.error("Error in getting class: ", error);
    throw error;
  }
};

/**
 * @function renameClass - Rename a class.
 * @param {string} classId - The class ID.
 * @param {string} name - The new class name.
 * @returns {Promise<Object>} The updated class object.
 * @throws {Error} Throws an error if the class fails to rename.
 */
const renameClass = async (classId, name) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { name },
      { new: true }
    );
    return updatedClass;
  } catch (error) {
    console.error("Error in renaming class: ", error);
    throw error;
  }
};

/**
 * @function addAdmin - Add an admin to a class.
 * @param {string} classId - The class ID.
 * @param {string} userId - The user ID.
 * @returns {Promise<Object>} The updated class object.
 * @throws {Error} Throws an error if the admin fails to add.
 */
const addAdmin = async (classId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId))
    throw new Error("Invalid user ID");

  try {
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { admins: userId } },
      { new: true }
    );
    return updatedClass;
  } catch (error) {
    console.error("Error in adding admin: ", error);
    throw error;
  }
};

/**
 * @function removeAdmin - Remove an admin from a class.
 * @param {string} classId - The class ID.
 * @param {string} userId - The user ID.
 * @returns {Promise<Object>} The updated class object.
 * @throws {Error} Throws an error if the admin fails to remove.
 */
const removeAdmin = async (classId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId))
    throw new Error("Invalid user ID");

  try {
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $pull: { admins: userId } },
      { new: true }
    );
    return updatedClass;
  } catch (error) {
    console.error("Error in removing admin: ", error);
    throw error;
  }
};

/**
 * @function addStudent - Add a student to a class.
 * @param {string} classId - The class ID.
 * @param {Object} studentNumber - The student number.
 * @param {string} name - The student name.
 * @returns {Promise<Object>} The updated class object.
 * @throws {Error} Throws an error if the student fails to add.
 */
const addStudent = async (classId, studentNumber, name) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { students: { studentNumber, name } } },
      { new: true }
    );
    return updatedClass;
  } catch (error) {
    console.error("Error in adding student: ", error);
    throw error;
  }
};

/**
 * @function renameStudent - Rename a student in a class.
 * @param {string} classId - The class ID.
 * @param {number} studentNumber - The student number.
 * @param {string} name - The new student name.
 * @returns {Promise<Object>} The updated class object.
 * @throws {Error} Throws an error if the student fails to rename.
 */
const renameStudent = async (classId, studentNumber, name) => {
  try {
    const updatedClass = await Class.findOneAndUpdate(
      {
        _id: classId,
        "students.studentNumber": studentNumber,
      },
      { $set: { "students.$.name": name } },
      { new: true }
    );
    return updatedClass;
  } catch (error) {
    console.error("Error in renaming student: ", error);
    throw error;
  }
};

/**
 * @function deleteStudent - Delete a student from a class. (soft delete)
 * @param {string} classId - The class ID.
 * @param {number} studentNumber - The student number.
 * @returns {Promise<Object>} The updated class object.
 * @throws {Error} Throws an error if the student fails to delete.
 */
const deleteStudent = async (classId, studentNumber) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $set: { "students.$[elem].deleted": true } },
      {
        arrayFilters: [{ "elem.studentNumber": studentNumber }],
        new: true,
      }
    );
    return updatedClass;
  } catch (error) {
    console.error("Error in removing student: ", error);
    throw error;
  }
};

/**
 * @function deleteClass - Delete a class. (soft delete)
 * @param {string} classId - The class ID.
 * @returns {Promise<Object>} The deleted class object.
 * @throws {Error} Throws an error if the class fails to delete.
 */
const deleteClass = async (classId) => {
  try {
    const deletedClass = await Class.findByIdAndUpdate(
      classId,
      { deleted: true },
      { new: true }
    );
    return deletedClass;
  } catch (error) {
    console.error("Error in deleting class: ", error);
    throw error;
  }
};

module.exports = {
  createClass,
  getClass,
  renameClass,
  addAdmin,
  removeAdmin,
  addStudent,
  renameStudent,
  deleteStudent,
  deleteClass,
};