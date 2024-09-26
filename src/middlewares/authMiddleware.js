/**
 * @file src/middlewares/authMiddleware.js
 * @description Middleware for user authentication.
 */

const jwtService = require("../services/jwtService");

const publicRoutes = [
  "/api/auth/register",
  "/api/auth/complete-registration",
  "/api/auth/login",
  "/api/auth/refresh-token",
  "/api/auth/reset-password",
  "/api/auth/complete-reset-password",
];

const publicRootRoutes = ["/api/problems"];

/**
 * @function authMiddleware - Authenticate the user's JWT.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Function} - The next middleware function.
 */
const authMiddleware = (req, res, next) => {
  if (publicRoutes.includes(req.path)) {
    return next();
  }

  if (publicRootRoutes.some((route) => req.path.startsWith(route))) {
    return next();
  }

  let token = req.headers["authorization"];

  if (!token) {
    return res.unauthorized("No token provided.", "NO_TOKEN");
  }

  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
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
