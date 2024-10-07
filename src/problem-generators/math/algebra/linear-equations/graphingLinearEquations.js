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

  const forms = [];
  if (options.includeStandard) forms.push("standard");
  if (options.includeSlopeIntercept) forms.push("slopeIntercept");
  if (options.includePointSlope) forms.push("pointSlope");

  const selectedForm = forms.length > 0 ? randomElement(forms) : "standard";

  let xIntercept = null,
    yIntercept = null;
  switch (selectedForm) {
    case "standard": {
      const a = randomInt(-5, 5);
      equation = `${a}x ${bSign} ${absB}y = ${b * x1 + a * y1}`;
      if (a !== 0) xIntercept = (b * x1 + a * y1) / a;
      if (b !== 0) yIntercept = (b * x1 + a * y1) / b;
      break;
    }
    case "slopeIntercept": {
      equation = `y = ${m}x ${bSign} ${absB}`;
      xIntercept = m !== 0 ? -b / m : null;
      yIntercept = b;
      break;
    }
    case "pointSlope": {
      equation = `y ${y1Sign} ${absY1} = ${m}(x ${x1Sign} ${absX1})`;
      xIntercept = m !== 0 ? (y1 - m * x1) / m : null;
      yIntercept = y1;
      break;
    }
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

  // Initialize default bounds
  let xMin = -10,
    xMax = 10,
    yMin = -10,
    yMax = 10;
  const padding = 2; // Additional padding to give a little extra space around the graph

  // Adjust mathBounds based on intercepts, ensuring they are visible and adding padding
  if (xIntercept !== null && !isNaN(xIntercept)) {
    xMin = Math.min(xMin, Math.floor(xIntercept) - padding);
    xMax = Math.max(xMax, Math.ceil(xIntercept) + padding);
  }
  if (yIntercept !== null && !isNaN(yIntercept)) {
    yMin = Math.min(yMin, Math.floor(yIntercept) - padding);
    yMax = Math.max(yMax, Math.ceil(yIntercept) + padding);
  }

  // Adjust the height and width based on the intercepts
  const xRange = xMax - xMin;
  const yRange = yMax - yMin;

  // Maintain a reasonable aspect ratio for the graph (optional step)
  if (xRange > yRange) {
    const diff = xRange - yRange;
    yMin -= diff / 2;
    yMax += diff / 2;
  } else if (yRange > xRange) {
    const diff = yRange - xRange;
    xMin -= diff / 2;
    xMax += diff / 2;
  }

  const solution = [
    {
      type: "graph",
      value: {
        renderEngine: "desmos",
        expressions: [
          {
            type: "expression",
            latex: equation,
          },
        ],
        mathBounds: {
          left: xMin,
          right: xMax,
          bottom: yMin,
          top: yMax,
        },
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
