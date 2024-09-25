/**
 * @file tests/controllers/taskController.test.js
 * @description Tests for the task controller functions.
 */

const request = require("supertest");
const app = require("../../server");
const taskService = require("../../src/services/taskService");
const classService = require("../../src/services/classService");
const validationUtils = require("../../src/utils/validationUtils");

jest.mock("../../src/middlewares/authMiddleware", () => {
  return jest.fn((req, res, next) => {
    req.user = { userId: "userId" };
    next();
  });
});

jest.mock("../../src/services/taskService");
jest.mock("../../src/services/classService");
jest.mock("../../src/utils/validationUtils");

const ProblemGenerator = require("../../src/problem-generators");
const problemGenerator = new ProblemGenerator();
jest.mock("../../src/problem-generators");

describe("TaskController - createTask", () => {
  it("should return 400 if class ID is invalid", async () => {
    const taskData = {
      classId: "invalidClassId",
      name: "Test Task",
      description: "Test Description",
      options: { isIndividualTask: true },
    };
    validationUtils.validateClassCode.mockReturnValue(false);

    const response = await request(app)
      .post("/api/classes/classId/tasks")
      .send(taskData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid class ID.");
    expect(response.body.error.code).toBe("INVALID_CLASS_ID");
  });

  it("should return 400 if task name is invalid", async () => {
    const taskData = {
      classId: "validClassId",
      name: "",
      description: "Test Description",
      options: { isIndividualTask: true },
    };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateTaskName.mockReturnValue(false);

    const response = await request(app)
      .post("/api/classes/classId/tasks")
      .send(taskData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid task name.");
    expect(response.body.error.code).toBe("INVALID_TASK_NAME");
  });

  it("should return 400 if task description is invalid", async () => {
    const taskData = {
      classId: "validClassId",
      name: "Test Task",
      description: "",
      options: { isIndividualTask: true },
    };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateTaskName.mockReturnValue(true);
    validationUtils.validateTaskDescription.mockReturnValue(false);

    const response = await request(app)
      .post("/api/classes/classId/tasks")
      .send(taskData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid task description.");
    expect(response.body.error.code).toBe("INVALID_TASK_DESCRIPTION");
  });

  it("should return 400 if options are not provided", async () => {
    const taskData = {
      classId: "validClassId",
      name: "Test Task",
      description: "Test Description",
    };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateTaskName.mockReturnValue(true);
    validationUtils.validateTaskDescription.mockReturnValue(true);

    const response = await request(app)
      .post("/api/classes/classId/tasks")
      .send(taskData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Options are required.");
    expect(response.body.error.code).toBe("OPTIONS_REQUIRED");
  });

  it("should return 500 if problem generation fails", async () => {
    const taskData = {
      classId: "validClassId",
      name: "Test Task",
      description: "Test Description",
      options: { isIndividualTask: true },
    };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateTaskName.mockReturnValue(true);
    validationUtils.validateTaskDescription.mockReturnValue(true);
    classService.getClass.mockResolvedValue({
      students: [{ studentNumber: "123" }],
    });
    problemGenerator.generate.mockImplementation(() => {
      throw new Error("Error");
    });

    const response = await request(app)
      .post("/api/classes/classId/tasks")
      .send(taskData);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error in creating task.");
    expect(response.body.error.code).toBe("TASK_CREATION_ERROR");
  });

  it("should return 403 if class does not authorize to create task", async () => {
    const taskData = {
      classId: "validClassId",
      name: "Test Task",
      description: "Test Description",
      options: { isIndividualTask: true },
    };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateTaskName.mockReturnValue(true);
    validationUtils.validateTaskDescription.mockReturnValue(true);
    classService.getClass.mockResolvedValue({
      teacher: "otherUserId",
      admins: [],
      students: [{ studentNumber: "456" }],
    });

    const response = await request(app)
      .post("/api/classes/classId/tasks")
      .send(taskData);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "You are not authorized to create task."
    );
    expect(response.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 200 if task is created successfully", async () => {
    const taskData = {
      classId: "validClassId",
      name: "Test Task",
      description: "Test Description",
      options: { isIndividualTask: true },
    };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateTaskName.mockReturnValue(true);
    validationUtils.validateTaskDescription.mockReturnValue(true);
    classService.getClass.mockResolvedValue({
      teacher: "userId",
      students: [{ studentNumber: "123" }],
    });
    problemGenerator.generate.mockReturnValue([{ problem: "problem1" }]);
    taskService.createTask.mockResolvedValue({ _id: "taskId" });

    const response = await request(app)
      .post("/api/classes/classId/tasks")
      .send(taskData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Task created successfully.");
    expect(response.body.data.taskId).toBe("taskId");
  });

  it("should return 500 if task creation fails", async () => {
    const taskData = {
      classId: "validClassId",
      name: "Test Task",
      description: "Test Description",
      options: { isIndividualTask: true },
    };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateTaskName.mockReturnValue(true);
    validationUtils.validateTaskDescription.mockReturnValue(true);
    classService.getClass.mockResolvedValue({
      students: [{ studentNumber: "123" }],
    });
    problemGenerator.generate.mockReturnValue([{ problem: "problem1" }]);
    taskService.createTask.mockRejectedValue(new Error("Error"));

    const response = await request(app)
      .post("/api/classes/classId/tasks")
      .send(taskData);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error in creating task.");
    expect(response.body.error.code).toBe("TASK_CREATION_ERROR");
  });
});

describe("TaskController - getTasks", () => {
  it("should return 404 if class is not found", async () => {
    const classId = "nonExistentClassId";
    classService.getClass.mockResolvedValue(null);

    const response = await request(app).get(`/api/classes/${classId}/tasks`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Class not found.");
    expect(response.body.error.code).toBe("CLASS_NOT_FOUND");
  });

  it("should return 403 if user is not authorized to get tasks", async () => {
    const classId = "validClassId";
    classService.getClass.mockResolvedValue({
      teacher: "otherUserId",
      admins: [],
    });

    const response = await request(app).get(`/api/classes/${classId}/tasks`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You are not authorized to get tasks.");
    expect(response.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 500 if there is an error in retrieving tasks", async () => {
    const classId = "validClassId";
    classService.getClass.mockResolvedValue({
      teacher: "userId",
    });
    taskService.getTasks.mockRejectedValue(new Error("Error"));

    const response = await request(app).get(`/api/classes/${classId}/tasks`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error in retrieving tasks.");
    expect(response.body.error.code).toBe("TASKS_RETRIEVAL_ERROR");
  });

  it("should return 200 and the tasks if tasks are retrieved successfully", async () => {
    const classId = "validClassId";
    const tasks = [
      { _id: "taskId1", name: "Task 1" },
      { _id: "taskId2", name: "Task 2" },
    ];
    classService.getClass.mockResolvedValue({
      teacher: "userId",
    });
    taskService.getTasks.mockResolvedValue(tasks);

    const response = await request(app).get(`/api/classes/${classId}/tasks`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Tasks retrieved successfully.");
    expect(response.body.data).toEqual(tasks);
  });
});

describe("TaskController - getTask", () => {
  it("should return 404 if task is not found", async () => {
    const taskId = "nonExistentTaskId";
    taskService.getTask.mockResolvedValue(null);

    const response = await request(app).get(`/api/tasks/${taskId}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Task not found.");
    expect(response.body.error.code).toBe("TASK_NOT_FOUND");
  });

  it("should return 404 if class is not found", async () => {
    const taskId = "validTaskId";
    taskService.getTask.mockResolvedValue({ classId: "nonExistentClassId" });
    classService.getClass.mockResolvedValue(null);

    const response = await request(app).get(`/api/tasks/${taskId}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Class not found.");
    expect(response.body.error.code).toBe("CLASS_NOT_FOUND");
  });

  it("should return 403 if user is not authorized to get task", async () => {
    const taskId = "validTaskId";
    taskService.getTask.mockResolvedValue({ classId: "validClassId" });
    classService.getClass.mockResolvedValue({
      teacher: "otherUserId",
      admins: [],
    });

    const response = await request(app).get(`/api/tasks/${taskId}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You are not authorized to get task.");
    expect(response.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 500 if there is an error in retrieving task", async () => {
    const taskId = "validTaskId";
    taskService.getTask.mockRejectedValue(new Error("Error"));

    const response = await request(app).get(`/api/tasks/${taskId}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error in retrieving task.");
    expect(response.body.error.code).toBe("TASK_RETRIEVAL_ERROR");
  });

  it("should return 200 and the task if task is retrieved successfully", async () => {
    const taskId = "validTaskId";
    const task = { _id: taskId, name: "Task 1", classId: "validClassId" };
    taskService.getTask.mockResolvedValue(task);
    classService.getClass.mockResolvedValue({
      teacher: "userId",
    });

    const response = await request(app).get(`/api/tasks/${taskId}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Task retrieved successfully.");
    expect(response.body.data).toEqual(task);
  });
});

describe("TaskController - getTaskProblems", () => {
  it("should return 404 if problems are not found", async () => {
    const taskId = "nonExistentTaskId";
    const studentNumber = "123";
    taskService.getTaskProblems.mockResolvedValue(null);

    const response = await request(app).get(
      `/api/tasks/${taskId}/problems/${studentNumber}`
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Problems not found.");
    expect(response.body.error.code).toBe("PROBLEMS_NOT_FOUND");
  });

  it("should return 404 if class is not found", async () => {
    const taskId = "validTaskId";
    const studentNumber = "123";
    taskService.getTaskProblems.mockResolvedValue({
      classId: "nonExistentClassId",
    });
    classService.getClass.mockResolvedValue(null);

    const response = await request(app).get(
      `/api/tasks/${taskId}/problems/${studentNumber}`
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Class not found.");
    expect(response.body.error.code).toBe("CLASS_NOT_FOUND");
  });

  it("should return 403 if user is not authorized to get problems", async () => {
    const taskId = "validTaskId";
    const studentNumber = "123";
    taskService.getTaskProblems.mockResolvedValue({ classId: "validClassId" });
    classService.getClass.mockResolvedValue({
      teacher: "otherUserId",
      admins: [],
    });

    const response = await request(app).get(
      `/api/tasks/${taskId}/problems/${studentNumber}`
    );

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "You are not authorized to get problems."
    );
    expect(response.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 500 if there is an error in retrieving problems", async () => {
    const taskId = "validTaskId";
    const studentNumber = "123";
    taskService.getTaskProblems.mockRejectedValue(new Error("Error"));

    const response = await request(app).get(
      `/api/tasks/${taskId}/problems/${studentNumber}`
    );

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error in retrieving problems.");
    expect(response.body.error.code).toBe("PROBLEMS_RETRIEVAL_ERROR");
  });

  it("should return 200 and the problems if problems are retrieved successfully", async () => {
    const taskId = "validTaskId";
    const studentNumber = "123";
    const problems = { problems: ["problem1", "problem2"] };
    taskService.getTaskProblems.mockResolvedValue(problems);
    classService.getClass.mockResolvedValue({
      teacher: "userId",
    });

    const response = await request(app).get(
      `/api/tasks/${taskId}/problems/${studentNumber}`
    );

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Problems retrieved successfully.");
    expect(response.body.data).toEqual(problems);
  });
});

describe("TaskController - updateGradingStatus", () => {
  it("should return 400 if graded status is invalid", async () => {
    const taskId = "validTaskId";
    const studentNumber = "123";
    const graded = "invalidStatus";

    const response = await request(app)
      .put(`/api/tasks/${taskId}/grade/${studentNumber}`)
      .send({ graded });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid graded status.");
    expect(response.body.error.code).toBe("INVALID_GRADED_STATUS");
  });

  it("should return 404 if task is not found", async () => {
    const taskId = "nonExistentTaskId";
    const studentNumber = "123";
    const graded = true;
    taskService.getTask.mockResolvedValue(null);

    const response = await request(app)
      .put(`/api/tasks/${taskId}/grade/${studentNumber}`)
      .send({ graded });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Task not found.");
    expect(response.body.error.code).toBe("TASK_NOT_FOUND");
  });

  it("should return 404 if class is not found", async () => {
    const taskId = "validTaskId";
    const studentNumber = "123";
    const graded = true;
    taskService.getTask.mockResolvedValue({ classId: "nonExistentClassId" });
    classService.getClass.mockResolvedValue(null);

    const response = await request(app)
      .put(`/api/tasks/${taskId}/grade/${studentNumber}`)
      .send({ graded });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Class not found.");
    expect(response.body.error.code).toBe("CLASS_NOT_FOUND");
  });

  it("should return 403 if user is not authorized to update grading status", async () => {
    const taskId = "validTaskId";
    const studentNumber = "123";
    const graded = true;
    taskService.getTask.mockResolvedValue({ classId: "validClassId" });
    classService.getClass.mockResolvedValue({
      teacher: "otherUserId",
      admins: [],
    });

    const response = await request(app)
      .put(`/api/tasks/${taskId}/grade/${studentNumber}`)
      .send({ graded });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "You are not authorized to update grading status."
    );
    expect(response.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 500 if there is an error in updating grading status", async () => {
    const taskId = "validTaskId";
    const studentNumber = "123";
    const graded = true;
    taskService.getTask.mockResolvedValue({ classId: "validClassId" });
    classService.getClass.mockResolvedValue({
      teacher: "userId",
    });
    taskService.updateGradingStatus.mockRejectedValue(new Error("Error"));

    const response = await request(app)
      .put(`/api/tasks/${taskId}/grade/${studentNumber}`)
      .send({ graded });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error in updating grading status.");
    expect(response.body.error.code).toBe("GRADING_STATUS_UPDATE_ERROR");
  });

  it("should return 200 if grading status is updated successfully", async () => {
    const taskId = "validTaskId";
    const studentNumber = "123";
    const graded = true;
    const updatedTask = { _id: taskId, graded };
    taskService.getTask.mockResolvedValue({ classId: "validClassId" });
    classService.getClass.mockResolvedValue({
      teacher: "userId",
    });
    taskService.updateGradingStatus.mockResolvedValue(updatedTask);

    const response = await request(app)
      .put(`/api/tasks/${taskId}/grade/${studentNumber}`)
      .send({ graded });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "Task grading status updated successfully."
    );
    expect(response.body.data).toEqual(updatedTask);
  });
});

describe("TaskController - renameTask", () => {
  it("should return 404 if task is not found", async () => {
    const taskId = "nonExistentTaskId";
    const taskName = "New Task Name";
    taskService.getTask.mockResolvedValue(null);

    const response = await request(app)
      .put(`/api/tasks/${taskId}/name`)
      .send({ name: taskName });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Task not found.");
    expect(response.body.error.code).toBe("TASK_NOT_FOUND");
  });

  it("should return 404 if class is not found", async () => {
    const taskId = "validTaskId";
    const taskName = "New Task Name";
    taskService.getTask.mockResolvedValue({ classId: "nonExistentClassId" });
    classService.getClass.mockResolvedValue(null);

    const response = await request(app)
      .put(`/api/tasks/${taskId}/name`)
      .send({ name: taskName });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Class not found.");
    expect(response.body.error.code).toBe("CLASS_NOT_FOUND");
  });

  it("should return 403 if user is not authorized to rename task", async () => {
    const taskId = "validTaskId";
    const taskName = "New Task Name";
    taskService.getTask.mockResolvedValue({ classId: "validClassId" });
    classService.getClass.mockResolvedValue({
      teacher: "otherUserId",
      admins: [],
    });

    const response = await request(app)
      .put(`/api/tasks/${taskId}/name`)
      .send({ name: taskName });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "You are not authorized to rename task."
    );
    expect(response.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 500 if there is an error in renaming task", async () => {
    const taskId = "validTaskId";
    const taskName = "New Task Name";
    taskService.getTask.mockResolvedValue({ classId: "validClassId" });
    classService.getClass.mockResolvedValue({
      teacher: "userId",
    });
    taskService.updateTaskName.mockRejectedValue(new Error("Error"));

    const response = await request(app)
      .put(`/api/tasks/${taskId}/name`)
      .send({ name: taskName });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error in renaming task.");
    expect(response.body.error.code).toBe("TASK_RENAME_ERROR");
  });

  it("should return 200 if task is renamed successfully", async () => {
    const taskId = "validTaskId";
    const taskName = "New Task Name";
    taskService.getTask.mockResolvedValue({ classId: "validClassId" });
    classService.getClass.mockResolvedValue({
      teacher: "userId",
    });
    taskService.updateTaskName.mockResolvedValue({
      _id: taskId,
      name: taskName,
    });

    const response = await request(app)
      .put(`/api/tasks/${taskId}/name`)
      .send({ name: taskName });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Task renamed successfully.");
    expect(response.body.data.name).toBe(taskName);
  });
});

describe("TaskController - updateDescription", () => {
  it("should return 404 if task is not found", async () => {
    const taskId = "nonExistentTaskId";
    const description = "New Description";
    taskService.getTask.mockResolvedValue(null);

    const response = await request(app)
      .put(`/api/tasks/${taskId}/description`)
      .send({ description });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Task not found.");
    expect(response.body.error.code).toBe("TASK_NOT_FOUND");
  });

  it("should return 404 if class is not found", async () => {
    const taskId = "validTaskId";
    const description = "New Description";
    taskService.getTask.mockResolvedValue({ classId: "nonExistentClassId" });
    classService.getClass.mockResolvedValue(null);

    const response = await request(app)
      .put(`/api/tasks/${taskId}/description`)
      .send({ description });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Class not found.");
    expect(response.body.error.code).toBe("CLASS_NOT_FOUND");
  });

  it("should return 403 if user is not authorized to update task description", async () => {
    const taskId = "validTaskId";
    const description = "New Description";
    taskService.getTask.mockResolvedValue({ classId: "validClassId" });
    classService.getClass.mockResolvedValue({
      teacher: "otherUserId",
      admins: [],
    });

    const response = await request(app)
      .put(`/api/tasks/${taskId}/description`)
      .send({ description });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "You are not authorized to update task description."
    );
    expect(response.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 500 if there is an error in updating task description", async () => {
    const taskId = "validTaskId";
    const description = "New Description";
    taskService.getTask.mockResolvedValue({ classId: "validClassId" });
    classService.getClass.mockResolvedValue({
      teacher: "userId",
    });
    taskService.updateTaskDescription.mockRejectedValue(new Error("Error"));

    const response = await request(app)
      .put(`/api/tasks/${taskId}/description`)
      .send({ description });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error in updating task description.");
    expect(response.body.error.code).toBe("TASK_DESCRIPTION_UPDATE_ERROR");
  });

  it("should return 200 if task description is updated successfully", async () => {
    const taskId = "validTaskId";
    const description = "New Description";
    const updatedTask = { _id: taskId, description };
    taskService.getTask.mockResolvedValue({ classId: "validClassId" });
    classService.getClass.mockResolvedValue({
      teacher: "userId",
    });
    taskService.updateTaskDescription.mockResolvedValue(updatedTask);

    const response = await request(app)
      .put(`/api/tasks/${taskId}/description`)
      .send({ description });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "Task description updated successfully."
    );
    expect(response.body.data).toEqual(updatedTask);
  });
});

describe("TaskController - deleteTask", () => {
  it("should return 404 if task is not found", async () => {
    const taskId = "nonExistentTaskId";
    taskService.getTask.mockResolvedValue(null);

    const response = await request(app).delete(`/api/tasks/${taskId}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Task not found.");
    expect(response.body.error.code).toBe("TASK_NOT_FOUND");
  });

  it("should return 404 if class is not found", async () => {
    const taskId = "validTaskId";
    taskService.getTask.mockResolvedValue({ classId: "nonExistentClassId" });
    classService.getClass.mockResolvedValue(null);

    const response = await request(app).delete(`/api/tasks/${taskId}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Class not found.");
    expect(response.body.error.code).toBe("CLASS_NOT_FOUND");
  });

  it("should return 403 if user is not authorized to delete task", async () => {
    const taskId = "validTaskId";
    taskService.getTask.mockResolvedValue({ classId: "validClassId" });
    classService.getClass.mockResolvedValue({
      teacher: "otherUserId",
      admins: [],
    });

    const response = await request(app).delete(`/api/tasks/${taskId}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "You are not authorized to delete task."
    );
    expect(response.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 500 if there is an error in deleting task", async () => {
    const taskId = "validTaskId";
    taskService.getTask.mockResolvedValue({ classId: "validClassId" });
    classService.getClass.mockResolvedValue({
      teacher: "userId",
    });
    taskService.deleteTask.mockRejectedValue(new Error("Error"));

    const response = await request(app).delete(`/api/tasks/${taskId}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error in deleting task.");
    expect(response.body.error.code).toBe("TASK_DELETION_ERROR");
  });

  it("should return 200 if task is deleted successfully", async () => {
    const taskId = "validTaskId";
    taskService.getTask.mockResolvedValue({ classId: "validClassId" });
    classService.getClass.mockResolvedValue({
      teacher: "userId",
    });
    taskService.deleteTask.mockResolvedValue({ _id: taskId });

    const response = await request(app).delete(`/api/tasks/${taskId}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Task deleted successfully.");
    expect(response.body.data._id).toBe(taskId);
  });
});
