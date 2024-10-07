/**
 * @file src/problem-generators/math/algebra/linear-equations/withAbsoluteValue.js
 * @description Generates problems for linear equations with absolute value. In this form, the equation is of the form |ax + b| = c.
 */

const math = require("mathjs");
const { randomInt, randomVariable } = require("../../../../utils/randomUtils");

/**
 * @function generateProblem - Generate a linear equation problem with absolute value.
 * @param {Object} options - The options for generating the problem.
 * @param {number} options.minCoefficient - The minimum value for the coefficient a.
 * @param {number} options.maxCoefficient - The maximum value for the coefficient a.
 * @param {number} options.minConstant - The minimum value for the constant b.
 * @param {number} options.maxConstant - The maximum value for the constant b.
 * @param {number} options.minSolution - The minimum value for the solution c.
 * @param {number} options.maxSolution - The maximum value for the solution c.
 * @returns {Object} - The linear equation problem with absolute value.
 */
const generateProblem = (options) => {
  const a = randomInt(options.minCoefficient, options.maxCoefficient);
  const b = randomInt(options.minConstant, options.maxConstant);
  const c = randomInt(options.minSolution, options.maxSolution);

  const x = randomVariable();

  const problem = [
    { type: "text", value: `Solve for ${x}:` },
    { type: "formula", value: `|${a}${x} + ${b}| = ${c}` },
  ];

  const steps = [
    {
      type: "text",
      value: "Consider the two cases for the absolute value expression.",
    },
    {
      type: "text",
      value:
        "Case 1: The expression inside the absolute value is positive or zero.",
    },
    { type: "formula", value: `${a}${x} + ${b} = ${c}` },
    {
      type: "text",
      value: "Subtract the constant term from both sides of the equation.",
    },
    { type: "formula", value: `${a}${x} = ${c - b}` },
    {
      type: "text",
      value:
        "Divide both sides of the equation by the coefficient of the variable.",
    },
    { type: "formula", value: `${x} = \\frac{${c - b}}{${a}}` },

    {
      type: "text",
      value: "Case 2: The expression inside the absolute value is negative.",
    },
    { type: "formula", value: `${a}${x} + ${b} = -${c}` },
    {
      type: "text",
      value: "Subtract the constant term from both sides of the equation.",
    },
    { type: "formula", value: `${a}${x} = -${c} - ${b}` },
    {
      type: "text",
      value:
        "Divide both sides of the equation by the coefficient of the variable.",
    },
    { type: "formula", value: `${x} = \\frac{-${c} - ${b}}{${a}}` },
    { type: "text", value: `Calculate the two possible values of ${x}.` },
  ];

  // Calculate solutions for both cases
  const solution1 = math.simplify(`${c - b}/${a}`).toString();
  const solution2 = math.simplify(`(-${c} - ${b})/${a}`).toString();
  const simplifiedFraction1 = math.fraction(c - b, a);
  const simplifiedFraction2 = math.fraction(-c - b, a);
  const simplifiedString1 =
    simplifiedFraction1.d === 1
      ? simplifiedFraction1.n
      : `\\frac{${simplifiedFraction1.n}}{${simplifiedFraction1.d}}`;
  const simplifiedString2 =
    simplifiedFraction2.d === 1
      ? simplifiedFraction2.n
      : `\\frac{${simplifiedFraction2.n}}{${simplifiedFraction2.d}}`;

  steps.push(
    { type: "formula", value: `${x} = ${simplifiedString1}` },
    { type: "formula", value: `${x} =  ${simplifiedString2}` }
  );

  const solution = [
    {
      type: "numeric",
      decimal: math.evaluate(solution1),
      fraction:
        simplifiedFraction1.d === 1
          ? null
          : {
              s: simplifiedFraction1.s,
              n: simplifiedFraction1.n,
              d: simplifiedFraction1.d,
            },
    },
    {
      type: "numeric",
      decimal: math.evaluate(solution2),
      fraction:
        simplifiedFraction2.d === 1
          ? null
          : {
              s: simplifiedFraction2.s,
              n: simplifiedFraction2.n,
              d: simplifiedFraction2.d,
            },
    },
  ];

  return {
    problem,
    steps,
    solution,
  };
};

module.exports = generateProblem;
