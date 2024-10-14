/**
 * @file src/controllers/problemController.js
 * @description Controller for problem generation.
 */

const ProblemGenerator = require("mpclab");
const problemGenerator = new ProblemGenerator();

/**
 * @function getIndex - Get the problem generator index.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
getIndex = (req, res) => {
  res.success(
    problemGenerator.index,
    "Problem generator index retrieved successfully."
  );
};

/**
 * @function generateProblem - Generate a new problem.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
generateProblem = (req, res) => {
  try {
    const topicsString = req.params[0];
    const options = JSON.parse(req.query.options || "{}");

    const topics = topicsString.split("/");

    const problem = problemGenerator.generateOne({
      path: topics,
      options: options,
    });

    return res.success(problem, "Problem generated successfully.");
  } catch (error) {
    if (error.message === "Generator not found") {
      return res.notFound("Generator not found.", "GENERATOR_NOT_FOUND");
    }
    return res.internalServerError(
      "Error generating problem.",
      "GENERATE_PROBLEM_ERROR"
    );
  }
};

module.exports = {
  getIndex,
  generateProblem,
};
