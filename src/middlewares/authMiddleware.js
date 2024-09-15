/**
 * @file src/middlewares/authMiddleware.js
 * @description Middleware for user authentication.
 */

const jwtService = require("../services/jwtService");

/**
 * @function authMiddleware - Authenticate the user's JWT.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Function} - The next middleware function.
 */
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.unauthorized("No token provided.", "NO_TOKEN");
  }

  try {
    const payload = jwtService.verifyToken(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.unauthorized("Token expired.", "TOKEN_EXPIRED");
    }
    if (error.name === "JsonWebTokenError") {
      return res.badRequest("Invalid token.", "INVALID_TOKEN");
    } else {
      return res.internalServerError(
        "Error verifying token.",
        "VERIFY_TOKEN_ERROR"
      );
    }
  }
};

module.exports = authMiddleware;
