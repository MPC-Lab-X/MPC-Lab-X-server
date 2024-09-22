/**
 * @file src/problem-generators/math/algebra/linear-equations/slopeInterceptForm.js
 * @description Generates problems for linear equations in slope-intercept form. In slope-intercept form, the equation is of the form y = mx + b. (calculation of m and b)
 */

const { randomInt } = require("../../../../utils/randomUtils");

/**
 * @function generateProblem - Generate a linear equation problem in slope-intercept form.
 * @param {Object} options - The options for generating the problem.
 * @param {number} options.isMCQ - Whether the problem is multiple choice.
 * @param {number} options.isSimplified - Whether the problem is simplified.
 * @param {number} options.minSlope - The minimum value for the slope m.
 * @param {number} options.maxSlope - The maximum value for the slope m.
 * @param {number} options.minYIntercept - The minimum value for the y-intercept b.
 * @param {number} options.maxYIntercept - The maximum value for the y-intercept b.
 * @returns {Object} - The linear equation problem in slope-intercept form.
 */
const generateProblem = (options) => {
  const m = randomInt(options.minSlope, options.maxSlope);
  const b = randomInt(options.minYIntercept, options.maxYIntercept);

  const x = "x";
  const y = "y";

  let mMultiplier = 1;
  let bMultiplier = 1;
  let coefficientY = 1;

  let equation = `${y} = ${m}${x} + ${b}`;

  // If the problem is not simplified, multiply all terms by a random integer
  if (!options.isSimplified) {
    const randomMultiplier = randomInt(2, 5);
    equation = `${randomMultiplier}${y} = ${randomMultiplier * m}${x} + ${
      randomMultiplier * b
    }`;
    coefficientY = randomMultiplier;
    mMultiplier *= randomMultiplier;
    bMultiplier *= randomMultiplier;
  }

  const steps = [
    {
      type: "text",
      value: `Simplify the equation by dividing all terms by ${coefficientY}.`,
    },
    { type: "formula", value: `${y} = ${m}${x} + ${b}` },
    {
      type: "text",
      value: `The slope of the line is ${m} and the y-intercept is ${b}.`,
    },
  ];

  // If the problem is not multiple choice, return the problem, steps, and solution
  if (!options.isMCQ) {
    const problem = [
      {
        type: "text",
        value: `Write the equation in slope-intercept form, and identify the slope and y-intercept.`,
      },
      { type: "formula", value: equation },
    ];

    const solution = [
      {
        type: "numeric",
        label: "Slope",
        decimal: m,
      },
      {
        type: "numeric",
        label: "Y-intercept",
        decimal: b,
      },
    ];

    return {
      problem,
      steps,
      solution,
    };
  } else {
    // Generate multiple choice options
    const slopeChoices = [m, m + randomInt(2, 5), m - randomInt(2, 5), m * -1];
    const yInterceptChoices = [
      b,
      b + randomInt(2, 5),
      b - randomInt(2, 5),
      b * -1,
    ];

    let choices = [];
    for (let i = 0; i < 4; i++) {
      choices.push({
        type: "text",
        value: `Slope: ${slopeChoices[i]}, Y-intercept: ${yInterceptChoices[i]}`,
        correct: i === 0,
      });
    }

    // Shuffle the choices
    choices = choices.sort(() => Math.random() - 0.5);

    let problem = [
      {
        type: "text",
        value: `Which of the following represents the slope and y-intercept of the line?`,
      },
      { type: "formula", value: equation },
      { type: "mcq", value: choices },
    ];

    const solution = [
      {
        type: "choice",
        choice: 0,
      },
    ];

    problem[2].value.forEach((choice, index) => {
      if (choice.correct) {
        solution[0].choice = index;
      }
      delete choice.correct;
    });

    return {
      problem,
      steps,
      solution,
    };
  }
};

module.exports = generateProblem;
