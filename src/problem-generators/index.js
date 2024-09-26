/**
 * @file src/problem-generators/index.js
 * @description This file is the entry point for all problem generators. It loads all problem generators from the file system and generates problems for the specified topics.
 */

const fs = require("fs");
const path = require("path");

class ProblemGenerator {
  /**
   * @constructor - Create a new ProblemGenerator instance.
   * @param {Object} config - The configuration for the ProblemGenerator.
   * @param {number} config.maxCount - The maximum number of problems to generate.
   */
  constructor(config = {}) {
    this.maxCount = config.maxCount || 1000;

    this.index = JSON.parse(
      fs.readFileSync(path.join(__dirname, "index.json"), "utf8")
    );
    this.generators = this.loadGenerators();
    this.parameters = this.loadParameters();
  }

  /**
   * @function loadGenerators - Load all problem generators from the file system.
   * @returns {Object} - The problem generators for the specified topic.
   */
  loadGenerators() {
    const generators = {};

    const loadGenerator = (node, currentPath) => {
      let generators = {};

      if (node.topics) {
        for (const subtopic in node.topics) {
          generators[subtopic] = loadGenerator(node.topics[subtopic], [
            ...currentPath,
            subtopic,
          ]);
        }
      } else {
        const generatorPath = path.join(__dirname, ...currentPath);

        const generator = require(generatorPath);
        generators = generator;
      }

      return generators;
    };

    for (const subject in this.index) {
      generators[subject] = loadGenerator(this.index[subject], [subject]);
    }

    return generators;
  }

  /**
   * @function loadParameters - Load all problem parameters from the file system.
   * @returns {Object} - The problem parameters for the specified topic.
   */
  loadParameters() {
    const generators = {};

    const loadGenerator = (node) => {
      let generators = {};

      if (node.topics) {
        for (const subtopic in node.topics) {
          generators[subtopic] = loadGenerator(node.topics[subtopic]);
        }
      } else {
        const parameters = node.parameters;
        generators = parameters;
      }

      return generators;
    };

    for (const subject in this.index) {
      generators[subject] = loadGenerator(this.index[subject]);
    }

    return generators;
  }

  /**
   * @function generate - Generate problems for the specified topics.
   * @param {Object} options - The options for generating the problems.
   * @param {Array<Object>} options.topics - The topics for generating the problems.
   * @param {boolean} options.shuffle - Whether to shuffle the problems
   * @returns {Array<Object>} - The generated problems.
   */
  generate(options) {
    const problems = [];

    try {
      for (const topic of options.topics) {
        const path = topic.path;
        const topicOptions = topic.options;

        const generator = path.reduce((acc, cur) => acc[cur], this.generators);
        const parameters = path.reduce((acc, cur) => acc[cur], this.parameters);

        if (!generator || !parameters) {
          throw new Error("Generator not found");
        }

        for (const key in parameters) {
          if (topicOptions[key] === undefined) {
            topicOptions[key] = parameters[key];
          }
        }

        for (const key in topicOptions) {
          if (parameters[key] === undefined) {
            delete topicOptions[key];
          }
        }

        const count = Math.min(topicOptions.count || 5, this.maxCount);
        delete topicOptions.count;
        const topicProblems = [];
        for (let i = 0; i < count; i++) {
          const problem = generator(topicOptions);
          topicProblems.push(problem);
        }

        problems.push(...topicProblems);
      }

      if (options.shuffle) {
        problems.sort(() => Math.random() - 0.5);
      }
    } catch (e) {
      throw e;
    }

    return problems;
  }

  /**
   * @function generateOne - Generate a single problem for the specified topics.
   * @param {Object} topic - The topic for generating the problem.
   * @returns {Object} - The generated problem.
   */
  generateOne(topic) {
    const problems = this.generate({ topics: [topic], shuffle: false });
    return problems[0];
  }

  /**
   * @function testDuplicate - Test for duplicate problems in the generated problems.
   * @param {Array<Object>} problems - The generated problems.
   * @returns {number} - The number of duplicate problems.
   */
  testDuplicate(problems) {
    const problemSet = new Set(
      problems.map((problem) => JSON.stringify(problem))
    );
    return problems.length - problemSet.size;
  }
}

module.exports = ProblemGenerator;
