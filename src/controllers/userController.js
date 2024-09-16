/**
 * @file src/controllers/userController.js
 * @description User controller for handling user operations.
 */

const userService = require("../services/userService");

/**
 * @function getUser - Get a user by ID.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userService.getUserById(id);
    if (!user) {
      return res.notFound("User not found.", "USER_NOT_FOUND");
    }
    return res.success(user, "User found successfully.");
  } catch (error) {
    return res.internalServerError(
      "Error getting user.",
      "GET_USER_ERROR",
      error
    );
  }
};

module.exports = {
  getUser,
};