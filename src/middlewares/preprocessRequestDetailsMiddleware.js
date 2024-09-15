/**
 * @file src/middlewares/preprocessRequestDetailsMiddleware.js
 * @description Middleware for preprocessing request details.
 */

/**
 * @function preprocessRequestDetailsMiddleware - Preprocess request details.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Function} - The next middleware function.
 */
const preprocessRequestDetailsMiddleware = (req, res, next) => {
  // Check if X-FORWARDED-FOR header is present
  if (req.headers["x-forwarded-for"]) {
    // Get the first IP address from the X-FORWARDED-FOR header
    const ip = req.headers["x-forwarded-for"].split(",")[0].trim();
    req.ip = ip;
  } else {
    // Populate the IP address from the request object
    req.ip = (req.ip && req.ip.match(/\d+\.\d+\.\d+\.\d+/)?.[0]) || "unknown";
  }

  // Populate the User-Agent from the request object
  req.headers["user-agent"] = req.headers["user-agent"] || "unknown";

  next();
};

module.exports = preprocessRequestDetailsMiddleware;
