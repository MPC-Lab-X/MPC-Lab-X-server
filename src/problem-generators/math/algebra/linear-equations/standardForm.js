/**
 * @file src/problem-generators/math/algebra/linear-equations/standardForm.js
 * @description Generates problems for linear equations in standard form. In standard form, the equation is of the form ax + b = c.
 */

const math = require("mathjs");
const { randomInt, randomVariable } = require("../../../../utils/randomUtils");

/**
 * @function generateProblem - Generate a linear equation problem.
 * @param {Object} options - The options for generating the problem.
 * @param {number} options.minCoefficient - The minimum value for the coefficient a.
 * @param {number} options.maxCoefficient - The maximum value for the coefficient a.
 * @param {number} options.minConstant - The minimum value for the constant b.
 * @param {number} options.maxConstant - The maximum value for the constant b.
 * @param {number} options.minSolution - The minimum value for the solution c.
 * @param {number} options.maxSolution - The maximum value for the solution c.
 * @returns {Object} - The linear equation problem.
 */
const generateProblem = (options) => {
  const a = randomInt(options.minCoefficient, options.maxCoefficient);
  const b = randomInt(options.minConstant, options.maxConstant);
  const c = randomInt(options.minSolution, options.maxSolution);

  // Adjust the constant term to ensure that the solution is an integer
  const adjustedC = b + a * Math.floor((c - b) / a);

  const x = randomVariable();

  const bSign = b < 0 ? "-" : "+";
  const absB = Math.abs(b);

  const problem = [
    { type: "text", value: `Solve for ${x}:` },
    { type: "formula", value: `${a}${x} ${bSign} ${absB} = ${adjustedC}` },
  ];

  const steps = [
    {
      type: "text",
      value: "Subtract the constant term from both sides of the equation.",
    },
    { type: "formula", value: `${a}${x} = ${adjustedC - b}` },
    {
      type: "text",
      value:
        "Divide both sides of the equation by the coefficient of the variable.",
    },
    { type: "formula", value: `${x} = \\frac{${adjustedC - b}}{${a}}` },
    { type: "text", value: `Calculate the value of ${x}.` },
  ];

  // Calculate the solution
  const numerator = adjustedC - b;
  const denominator = a;
  const simplified = math.simplify(`${numerator}/${denominator}`);

  steps.push({ type: "formula", value: `${x} = ${math.format(simplified)}` });

  return {
    problem,
    steps,
    solution: {
      type: "numeric",
      decimal: math.evaluate(math.format(simplified)),
    },
  };
};

module.exports = generateProblem;
