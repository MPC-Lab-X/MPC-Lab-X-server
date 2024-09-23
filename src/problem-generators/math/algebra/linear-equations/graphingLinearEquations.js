/**
 * @file src/problem-generators/math/algebra/linear-equations/graphingLinearEquations.js
 * @description Generates problems for graphing linear equations. (standard form, slope-intercept form, point-slope form)
 */

const { randomInt, randomElement } = require("../../../../utils/randomUtils");

/**
 * @function generateProblem - Generate a problem for graphing a linear equation.
 * @param {Object} options - The options for generating the problem.
 * @param {boolean} options.includeStandard - Whether to include the standard form option.
 * @param {boolean} options.includeSlopeIntercept - Whether to include the slope-intercept form option.
 * @param {boolean} options.includePointSlope - Whether to include the point-slope form option.
 * @returns {Object} - The linear equation graphing problem.
 */
const generateProblem = (options) => {
  let equation;
  const m = randomInt(-5, 5);
  const b = randomInt(-10, 10);
  const x1 = randomInt(-5, 5);
  const y1 = randomInt(-10, 10);

  const bSign = b < 0 ? "-" : "+";
  const y1Sign = y1 < 0 ? "-" : "+";
  const x1Sign = x1 < 0 ? "-" : "+";
  const absB = Math.abs(b);
  const absY1 = Math.abs(y1);
  const absX1 = Math.abs(x1);

  // Randomly select the type of equation to use based on options
  const forms = [];
  if (options.includeStandard) forms.push("standard");
  if (options.includeSlopeIntercept) forms.push("slopeIntercept");
  if (options.includePointSlope) forms.push("pointSlope");

  const selectedForm = forms.length > 0 ? randomElement(forms) : "standard";

  switch (selectedForm) {
    case "standard":
      const a = randomInt(-5, 5);
      equation = `${a}x ${bSign} ${absB}y = ${b * x1 + a * y1}`; // Form ax + by = c
      break;
    case "slopeIntercept":
      equation = `y = ${m}x ${bSign} ${absB}`; // Form y = mx + b
      break;
    case "pointSlope":
      equation = `y ${y1Sign} ${absY1} = ${m}(x ${x1Sign} ${absX1})`; // Form y - y1 = m(x - x1)
      break;
  }

  const problem = [
    {
      type: "text",
      value: `Graph the following linear equation:`,
    },
    {
      type: "formula",
      value: equation,
    },
  ];

  const steps = [];

  const solution = [
    {
      type: "graph",
      value: equation,
    },
  ];

  return {
    problem,
    steps,
    solution,
  };
};

module.exports = generateProblem;
