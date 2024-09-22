/**
 * @file src/problem-generators/math/algebra/linear-equations/withParentheses.js
 * @description Generates problems for linear equations with parentheses. In this form, the equation is of the form a(x + b) = c.
 */

const math = require("mathjs");
const { randomInt, randomVariable } = require("../../../../utils/randomUtils");

/**
 * @function generateProblem - Generate a linear equation problem with parentheses.
 * @param {Object} options - The options for generating the problem.
 * @param {number} options.minCoefficient - The minimum value for the coefficient a.
 * @param {number} options.maxCoefficient - The maximum value for the coefficient a.
 * @param {number} options.minConstant - The minimum value for the constant b.
 * @param {number} options.maxConstant - The maximum value for the constant b.
 * @param {number} options.minSolution - The minimum value for the solution c.
 * @param {number} options.maxSolution - The maximum value for the solution c.
 * @returns {Object} - The linear equation problem with parentheses.
 */
const generateProblem = (options) => {
  const a = randomInt(options.minCoefficient, options.maxCoefficient);
  const b = randomInt(options.minConstant, options.maxConstant);
  const c = randomInt(options.minSolution, options.maxSolution);

  const x = randomVariable();

  const problem = [
    { type: "text", value: `Solve for ${x}:` },
    { type: "formula", value: `${a}(${x} + ${b}) = ${c}` },
  ];

  const steps = [
    {
      type: "text",
      value: "Distribute the coefficient a across the parentheses.",
    },
    { type: "formula", value: `${a}${x} + ${a * b} = ${c}` },
    {
      type: "text",
      value: "Subtract the constant term from both sides of the equation.",
    },
    { type: "formula", value: `${a}${x} = ${c - a * b}` },
    {
      type: "text",
      value:
        "Divide both sides of the equation by the coefficient of the variable.",
    },
    { type: "formula", value: `${x} = \\frac{${c - a * b}}{${a}}` },
    { type: "text", value: `Calculate the value of ${x}.` },
  ];

  // Calculate the solution
  const numerator = c - a * b;
  const denominator = a;
  const simplifiedFraction = math.fraction(numerator, denominator);
  const simplified = math.simplify(`${numerator}/${denominator}`);
  const simplifiedString =
    simplifiedFraction.d === 1
      ? simplifiedFraction.n
      : `\\frac{${simplifiedFraction.n}}{${simplifiedFraction.d}}`;

  steps.push({
    type: "formula",
    value: `${x} = ${simplifiedString}`,
  });

  const solution = [
    {
      type: "numeric",
      decimal: math.evaluate(math.format(simplified)),
      fraction: simplifiedFraction.d === 1 ? null : simplifiedFraction,
    },
  ];

  return {
    problem,
    steps,
    solution,
  };
};

module.exports = generateProblem;
