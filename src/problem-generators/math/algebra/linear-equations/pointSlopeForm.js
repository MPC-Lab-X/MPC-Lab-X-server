/**
 * @file src/problem-generators/math/algebra/linear-equations/pointSlopeForm.js
 * @description Generates problems for linear equations in point-slope form. In point-slope form, the equation is of the form y - y1 = m(x - x1). (calculation of m, x1, y1)
 */

const { randomInt } = require("../../../../utils/randomUtils");

/**
 * @function generateProblem - Generate a linear equation problem in point-slope form.
 * @param {Object} options - The options for generating the problem.
 * @param {number} options.isMCQ - Whether the problem is multiple choice.
 * @param {number} options.isSimplified - Whether the problem is simplified.
 * @param {number} options.minSlope - The minimum value for the slope m.
 * @param {number} options.maxSlope - The maximum value for the slope m.
 * @param {number} options.minPoint - The minimum value for the point (x1, y1).
 * @param {number} options.maxPoint - The maximum value for the point (x1, y1).
 * @returns {Object} - The linear equation problem in point-slope form.
 */
const generateProblem = (options) => {
  const m = randomInt(options.minSlope, options.maxSlope);
  const x1 = randomInt(options.minPoint, options.maxPoint);
  const y1 = randomInt(options.minPoint, options.maxPoint);

  const x = "x";
  const y = "y";

  const y1Sign = y1 < 0 ? "-" : "+";
  const x1Sign = x1 < 0 ? "-" : "+";
  const absY1 = Math.abs(y1);
  const absX1 = Math.abs(x1);

  let equation = `${y} ${y1Sign} ${absY1} = ${m}(${x} ${x1Sign} ${absX1})`;

  const steps = [
    {
      type: "text",
      value: `Simplify the equation by rearranging it.`,
    },
    { type: "formula", value: equation },
    {
      type: "text",
      value: `The slope of the line is ${m} and the point is (${x1}, ${y1}).`,
    },
  ];

  // If the problem is not simplified, multiply all terms by a random integer
  if (!options.isSimplified) {
    const randomMultiplier = randomInt(2, 5);
    const y1Sign = y1 * randomMultiplier < 0 ? "-" : "+";
    const x1Sign = x1 < 0 ? "-" : "+";
    const absY1 = Math.abs(y1 * randomMultiplier);
    const absX1 = Math.abs(x1);
    equation = `${randomMultiplier}${y} ${y1Sign} ${absY1} = ${
      randomMultiplier * m
    }(${x} ${x1Sign} ${absX1})`;
  }

  // If the problem is not multiple choice, return the problem, steps, and solution
  if (!options.isMCQ) {
    const problem = [
      {
        type: "text",
        value: `Write the equation in point-slope form and identify the slope and the point.`,
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
        type: "text",
        label: "Point (x1, y1)",
        value: `(${x1}, ${y1})`,
      },
    ];

    return {
      problem,
      steps,
      solution,
    };
  } else {
    // Generate multiple choice options
    const slopeChoices = [m, m + randomInt(1, 3), m - randomInt(1, 3), m * -1];
    const pointChoices = [
      `(${x1}, ${y1})`,
      `(${x1 + 1}, ${y1})`,
      `(${x1}, ${y1 + 1})`,
      `(${x1 - 1}, ${y1 - 1})`,
    ];

    let choices = [];
    for (let i = 0; i < 4; i++) {
      choices.push({
        type: "text",
        value: `Slope: ${slopeChoices[i]}, Point: ${pointChoices[i]}`,
        correct: i === 0,
      });
    }

    // Shuffle the choices
    choices = choices.sort(() => Math.random() - 0.5);

    let problem = [
      {
        type: "text",
        value: `Which of the following represents the slope and point of the line?`,
      },
      { type: "formula", value: equation },
      { type: "options", value: choices },
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
