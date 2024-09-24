/**
 * @file tests/services/taskService.test.js
 * @description Tests for task service functions.
 */

const Task = require("../../src/models/taskSchema");
const taskService = require("../../src/services/taskService");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Task.deleteMany({});
});

describe("Task Service", () => {
  describe("createTask", () => {
    it("should create a new task successfully", async () => {
      const taskData = {
        name: "Test Task",
        description: "Test Description",
        classId: "12345",
      };
      const createdTask = await taskService.createTask(taskData);

      expect(createdTask).toHaveProperty("_id");
      expect(createdTask.name).toBe(taskData.name);
      expect(createdTask.description).toBe(taskData.description);
      expect(createdTask.classId).toBe(taskData.classId);
    });

    it("should throw an error if task creation fails", async () => {
      const taskData = { name: "Test Task" };

      await expect(taskService.createTask(taskData)).rejects.toThrow();
    });
  });

  describe("getTasks", () => {
    it("should retrieve all tasks for a given class ID", async () => {
      const classId = "12345";
      const tasksData = [
        { name: "Task 1", description: "Description 1", classId },
        { name: "Task 2", description: "Description 2", classId },
      ];

      await Task.insertMany(tasksData);

      const tasks = await taskService.getTasks(classId);

      expect(tasks).toHaveLength(2);
      expect(tasks[0].name).toBe(tasksData[0].name);
      expect(tasks[1].name).toBe(tasksData[1].name);
    });

    it("should return an empty array if no tasks are found for the given class ID", async () => {
      const classId = "nonexistentClassId";
      const tasks = await taskService.getTasks(classId);

      expect(tasks).toHaveLength(0);
    });

    it("should throw an error if task retrieval fails", async () => {
      jest.spyOn(Task, "find").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      await expect(taskService.getTasks("12345")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("getTask", () => {
    it("should retrieve a task by ID successfully", async () => {
      const taskData = {
        name: "Test Task",
        description: "Test Description",
        classId: "12345",
      };
      const createdTask = await taskService.createTask(taskData);
      const retrievedTask = await taskService.getTask(createdTask._id);

      expect(retrievedTask).toHaveProperty("_id");
      expect(retrievedTask.name).toBe(taskData.name);
      expect(retrievedTask.description).toBe(taskData.description);
      expect(retrievedTask.classId).toBe(taskData.classId);
    });

    it("should return null if the task ID is invalid", async () => {
      const invalidTaskId = "invalidTaskId";
      const retrievedTask = await taskService.getTask(invalidTaskId);

      expect(retrievedTask).toBeNull();
    });

    it("should return null if the task is not found", async () => {
      const nonExistentTaskId = new mongoose.Types.ObjectId();
      const retrievedTask = await taskService.getTask(nonExistentTaskId);

      expect(retrievedTask).toBeNull();
    });

    it("should throw an error if task retrieval fails", async () => {
      jest.spyOn(Task, "findById").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      await expect(
        taskService.getTask("507f1f77bcf86cd799439011")
      ).rejects.toThrow("Database error");
    });
  });

  describe("getTaskProblems", () => {
    it("should retrieve problems for a given task and student number", async () => {
      const taskData = {
        name: "Test Task",
        description: "Test Description",
        classId: "12345",
        userTasks: [
          {
            studentNumber: 1,
            problems: '["Problem 1", "Problem 2"]',
          },
        ],
      };
      const createdTask = await Task.create(taskData);
      const problems = await taskService.getTaskProblems(createdTask._id, 1);

      expect(problems).toEqual(["Problem 1", "Problem 2"]);
    });

    it("should return null if the task ID is invalid", async () => {
      const problems = await taskService.getTaskProblems("invalidTaskId", 1);

      expect(problems).toBeNull();
    });

    it("should throw an error if the task is not found", async () => {
      const nonExistentTaskId = new mongoose.Types.ObjectId();

      await expect(
        taskService.getTaskProblems(nonExistentTaskId, 1)
      ).rejects.toThrow("Task not found");
    });

    it("should throw an error if the user task is not found", async () => {
      const taskData = {
        name: "Test Task",
        description: "Test Description",
        classId: "12345",
        userTasks: [
          {
            studentNumber: 1,
            problems: ["Problem 1", "Problem 2"],
          },
        ],
      };
      const createdTask = await Task.create(taskData);

      await expect(
        taskService.getTaskProblems(createdTask._id, 2)
      ).rejects.toThrow("User task not found");
    });

    it("should throw an error if task retrieval fails", async () => {
      jest.spyOn(Task, "findById").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      await expect(
        taskService.getTaskProblems("507f1f77bcf86cd799439011", 1)
      ).rejects.toThrow("Database error");
    });
  });

  describe("updateGradingStatus", () => {
    it("should update the grading status of a task successfully", async () => {
      const taskData = {
        name: "Test Task",
        description: "Test Description",
        classId: "12345",
        userTasks: [
          {
            studentNumber: 1,
            problems: ["Problem 1", "Problem 2"],
            graded: false,
          },
        ],
      };
      const createdTask = await Task.create(taskData);
      const updatedTask = await taskService.updateGradingStatus(
        createdTask._id,
        1,
        true
      );

      const userTask = updatedTask.userTasks.find(
        (task) => task.studentNumber === 1
      );

      expect(userTask.graded).toBe(true);
    });

    it("should return null if the task ID is invalid", async () => {
      const updatedTask = await taskService.updateGradingStatus(
        "invalidTaskId",
        1,
        true
      );

      expect(updatedTask).toBeNull();
    });

    it("should throw an error if the task is not found", async () => {
      const nonExistentTaskId = new mongoose.Types.ObjectId();

      await expect(
        taskService.updateGradingStatus(nonExistentTaskId, 1, true)
      ).rejects.toThrow("Task not found");
    });

    it("should throw an error if the user task is not found", async () => {
      const taskData = {
        name: "Test Task",
        description: "Test Description",
        classId: "12345",
        userTasks: [
          {
            studentNumber: 1,
            problems: ["Problem 1", "Problem 2"],
            graded: false,
          },
        ],
      };
      const createdTask = await Task.create(taskData);

      await expect(
        taskService.updateGradingStatus(createdTask._id, 2, true)
      ).rejects.toThrow("User task not found");
    });

    it("should throw an error if task update fails", async () => {
      jest.spyOn(Task.prototype, "save").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const taskData = {
        name: "Test Task",
        description: "Test Description",
        classId: "12345",
        userTasks: [
          {
            studentNumber: 1,
            problems: ["Problem 1", "Problem 2"],
            graded: false,
          },
        ],
      };
      const createdTask = await Task.create(taskData);

      await expect(
        taskService.updateGradingStatus(createdTask._id, 1, true)
      ).rejects.toThrow("Database error");
    });
  });

  describe("updateTaskName", () => {
    it("should update the task name successfully", async () => {
      const taskData = {
        name: "Old Task Name",
        description: "Test Description",
        classId: "12345",
      };
      const createdTask = await Task.create(taskData);
      const newName = "New Task Name";
      const updatedTask = await taskService.updateTaskName(
        createdTask._id,
        newName
      );

      expect(updatedTask).toHaveProperty("_id");
      expect(updatedTask.name).toBe(newName);
    });

    it("should return null if the task ID is invalid", async () => {
      const updatedTask = await taskService.updateTaskName(
        "invalidTaskId",
        "New Task Name"
      );

      expect(updatedTask).toBeNull();
    });

    it("should throw an error if the task is not found", async () => {
      const nonExistentTaskId = new mongoose.Types.ObjectId();

      await expect(
        taskService.updateTaskName(nonExistentTaskId, "New Task Name")
      ).rejects.toThrow("Task not found");
    });

    it("should throw an error if task update fails", async () => {
      jest.spyOn(Task, "findByIdAndUpdate").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const taskData = {
        name: "Old Task Name",
        description: "Test Description",
        classId: "12345",
      };
      const createdTask = await Task.create(taskData);

      await expect(
        taskService.updateTaskName(createdTask._id, "New Task Name")
      ).rejects.toThrow("Database error");
    });
  });

  describe("updateTaskDescription", () => {
    it("should update the task description successfully", async () => {
      const taskData = {
        name: "Test Task",
        description: "Old Description",
        classId: "12345",
      };
      const createdTask = await Task.create(taskData);
      const newDescription = "New Description";
      const updatedTask = await taskService.updateTaskDescription(
        createdTask._id,
        newDescription
      );

      expect(updatedTask).toHaveProperty("_id");
      expect(updatedTask.description).toBe(newDescription);
    });

    it("should return null if the task ID is invalid", async () => {
      const updatedTask = await taskService.updateTaskDescription(
        "invalidTaskId",
        "New Description"
      );

      expect(updatedTask).toBeNull();
    });

    it("should throw an error if the task is not found", async () => {
      const nonExistentTaskId = new mongoose.Types.ObjectId();

      await expect(
        taskService.updateTaskDescription(nonExistentTaskId, "New Description")
      ).rejects.toThrow("Task not found");
    });

    it("should throw an error if task update fails", async () => {
      jest.spyOn(Task, "findByIdAndUpdate").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const taskData = {
        name: "Test Task",
        description: "Old Description",
        classId: "12345",
      };
      const createdTask = await Task.create(taskData);

      await expect(
        taskService.updateTaskDescription(createdTask._id, "New Description")
      ).rejects.toThrow("Database error");
    });
  });

  describe("deleteTask", () => {
    it("should delete a task successfully", async () => {
      const taskData = {
        name: "Test Task",
        description: "Test Description",
        classId: "12345",
      };
      const createdTask = await Task.create(taskData);
      const deletedTask = await taskService.deleteTask(createdTask._id);

      expect(deletedTask).toHaveProperty("_id");
      expect(deletedTask._id.toString()).toBe(createdTask._id.toString());

      const foundTask = await Task.findById(createdTask._id);
      expect(foundTask).toBeNull();
    });

    it("should return null if the task ID is invalid", async () => {
      const deletedTask = await taskService.deleteTask("invalidTaskId");

      expect(deletedTask).toBeNull();
    });

    it("should throw an error if the task is not found", async () => {
      const nonExistentTaskId = new mongoose.Types.ObjectId();

      await expect(taskService.deleteTask(nonExistentTaskId)).rejects.toThrow(
        "Task not found"
      );
    });

    it("should throw an error if task deletion fails", async () => {
      jest.spyOn(Task, "findByIdAndDelete").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const taskData = {
        name: "Test Task",
        description: "Test Description",
        classId: "12345",
      };
      const createdTask = await Task.create(taskData);

      await expect(taskService.deleteTask(createdTask._id)).rejects.toThrow(
        "Database error"
      );
    });
  });
});
