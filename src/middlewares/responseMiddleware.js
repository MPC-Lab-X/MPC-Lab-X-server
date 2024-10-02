/**
 * @file src/middlewares/responseMiddleware.js
 * @description Middleware for handling responses.
 */

/**
 * @function responseMiddleware - Middleware for handling responses.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Function} - The next middleware function.
 */
const responseMiddleware = (req, res, next) => {
  /**
   * @function success - Sends a success response. (200)
   * @param {Object} data - The data to send in the response.
   * @param {string} message - The message to send in the response.
   */
  res.success = (data, message = "") => {
    res.status(200).json({
      status: "success",
      data: data,
      message: message,
    });
  };

  /**
   * @function error - Sends an error response.
   * @param {string} message - The message to send in the response.
   * @param {string} code - The error code.
   * @param {Object} details - The error details.
   * @param {number} statusCode - The status code to send in the response.
   */
  res.error = (message, code = "ERROR", details = {}, statusCode = 500) => {
    res.status(statusCode).json({
      status: "error",
      message: message,
      error: {
        code: code,
        details: details,
      },
    });
  };

  /**
   * @function badRequest - Sends a bad request response. (400)
   * @param {string} message - The message to send in the response.
   * @param {string} code - The error code.
   * @param {Object} details - The error details.
   */
  res.badRequest = (
    message = "Bad Request",
    code = "BAD_REQUEST",
    details = {}
  ) => {
    res.error(message, code, details, 400);
  };

  /**
   * @function unauthorized - Sends an unauthorized response. (401)
   * @param {string} message - The message to send in the response.
   * @param {string} code - The error code.
   * @param {Object} details - The error details.
   */
  res.unauthorized = (
    message = "Unauthorized",
    code = "UNAUTHORIZED",
    details = {}
  ) => {
    res.error(message, code, details, 401);
  };

  /**
   * @function forbidden - Sends a forbidden response. (403)
   * @param {string} message - The message to send in the response.
   * @param {string} code - The error code.
   * @param {Object} details - The error details.
   */
  res.forbidden = (message = "Forbidden", code = "FORBIDDEN", details = {}) => {
    res.error(message, code, details, 403);
  };

  /**
   * @function notFound - Sends a not found response. (404)
   * @param {string} message - The message to send in the response.
   * @param {string} code - The error code.
   * @param {Object} details - The error details.
   */
  res.notFound = (message = "Not Found", code = "NOT_FOUND", details = {}) => {
    res.error(message, code, details, 404);
  };

  /**
   * @function conflict - Sends a conflict response. (409)
   * @param {string} message - The message to send in the response.
   * @param {string} code - The error code.
   * @param {Object} details - The error details.
   */
  res.conflict = (message = "Conflict", code = "CONFLICT", details = {}) => {
    res.error(message, code, details, 409);
  };

  /**
   * @function preconditionFailed - Sends a precondition failed response. (412)
   * @param {string} message - The message to send in the response.
   * @param {string} code - The error code.
   * @param {Object} details - The error details.
   */
  res.preconditionFailed = (
    message = "Precondition Failed",
    code = "PRECONDITION_FAILED",
    details = {}
  ) => {
    res.error(message, code, details, 412);
  };

  /**
   * @function internalServerError - Sends an internal server error response. (500)
   * @param {string} message - The message to send in the response.
   * @param {string} code - The error code.
   * @param {Object} details - The error details.
   */
  res.internalServerError = (
    message = "Internal Server Error",
    code = "INTERNAL_SERVER_ERROR",
    details = {}
  ) => {
    res.error(message, code, details, 500);
  };

  next();
};

module.exports = responseMiddleware;
