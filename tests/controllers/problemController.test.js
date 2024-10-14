/**
 * @file tests/controllers/problemController.test.js
 * @description Tests for problem controller.
 */

const problemController = require("../../src/controllers/problemController");
const ProblemGenerator = require("mpclab");
const problemGenerator = new ProblemGenerator();
const index = problemGenerator.index;

jest.mock("mpclab");

describe("ProblemController - getIndex", () => {
  it("should return the problem generator index successfully", () => {
    const req = {};
    const res = {
      success: jest.fn(),
    };

    problemController.getIndex(req, res);

    expect(res.success).toHaveBeenCalledWith(
      index,
      "Problem generator index retrieved successfully."
    );
  });
});

describe("ProblemController - generateProblem", () => {
  it("should generate a problem successfully", () => {
    const req = {
      params: { 0: "math/algebra/linear-equations/withFractions" },
      query: { options: JSON.stringify({}) },
    };
    const res = {
      success: jest.fn(),
      notFound: jest.fn(),
      internalServerError: jest.fn(),
    };
    const generatedProblem = { problem: "generatedProblem" };
    ProblemGenerator.prototype.generateOne.mockReturnValue(generatedProblem);

    problemController.generateProblem(req, res);

    expect(ProblemGenerator.prototype.generateOne).toHaveBeenCalledWith({
      path: ["math", "algebra", "linear-equations", "withFractions"],
      options: {},
    });
    expect(res.success).toHaveBeenCalledWith(
      generatedProblem,
      "Problem generated successfully."
    );
  });

  it("should return 404 if generator is not found", () => {
    const req = {
      params: { 0: "invalidTopic" },
      query: { options: JSON.stringify({}) },
    };
    const res = {
      success: jest.fn(),
      notFound: jest.fn(),
      internalServerError: jest.fn(),
    };
    ProblemGenerator.prototype.generateOne.mockImplementation(() => {
      throw new Error("Generator not found");
    });

    problemController.generateProblem(req, res);

    expect(res.notFound).toHaveBeenCalledWith(
      "Generator not found.",
      "GENERATOR_NOT_FOUND"
    );
  });

  it("should return 500 if there is an error generating the problem", () => {
    const req = {
      params: { 0: "topic1/topic2" },
      query: { options: JSON.stringify({}) },
    };
    const res = {
      success: jest.fn(),
      notFound: jest.fn(),
      internalServerError: jest.fn(),
    };
    ProblemGenerator.prototype.generateOne.mockImplementation(() => {
      throw new Error("Some other error");
    });

    problemController.generateProblem(req, res);

    expect(res.internalServerError).toHaveBeenCalledWith(
      "Error generating problem.",
      "GENERATE_PROBLEM_ERROR"
    );
  });
});
