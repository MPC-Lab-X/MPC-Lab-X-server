/**
 * @file src/utils/rateLimiter.js
 * @description Rate limiter utility functions.
 */

const rateLimit = require("express-rate-limit");

/**
 * @function rateLimiter - Create a rate limiter middleware.
 * @param {number} max - The maximum number of requests.
 * @param {number} window - The time window in milliseconds.
 * @returns {Function} - A rate limiter middleware.
 */
const rateLimiter = (max = 150, window = 5 * 60 * 1000) => {
  if (process.env.NODE_ENV === "test") {
    return (req, res, next) => {
      next();
    };
  }

  return rateLimit({
    windowMs: window,
    max,
    handler: (req, res) => {
      res.status(429).json({
        status: "error",
        message: "Too many requests, please try again later.",
        error: {
          code: "TOO_MANY_REQUESTS",
          details: {
            max,
            window,
          },
        },
      });
    },
  });
};

module.exports = rateLimiter;
