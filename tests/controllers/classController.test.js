/**
 * @file tests/controllers/classController.test.js
 * @description Tests for the class controller.
 */

const request = require("supertest");
const app = require("../../server");
const classService = require("../../src/services/classService");
const userService = require("../../src/services/userService");
const validationUtils = require("../../src/utils/validationUtils");

jest.mock("../../src/middlewares/authMiddleware", () => {
  return jest.fn((req, res, next) => {
    req.user = { userId: "userId" };
    next();
  });
});

jest.mock("../../src/services/classService");
jest.mock("../../src/services/userService");
jest.mock("../../src/utils/validationUtils");

describe("ClassController - createClass", () => {
  it("should return 400 if class name is invalid", async () => {
    const classData = {
      name: "",
    };
    validationUtils.validateClassName.mockReturnValue(false);

    const response = await request(app).post("/api/classes").send(classData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid class name.");
    expect(response.body.error.code).toBe("INVALID_CLASS_NAME");
  });

  it("should return 200 if class is created", async () => {
    const classData = {
      name: "Test Class",
    };
    validationUtils.validateClassName.mockReturnValue(true);
    classService.createClass.mockResolvedValue(classData);

    const response = await request(app).post("/api/classes").send(classData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Class created successfully.");
    expect(response.body.data).toEqual(classData);
  });

  it("should return 500 if class fails to create", async () => {
    const classData = {
      name: "Test Class",
    };
    validationUtils.validateClassName.mockReturnValue(true);
    classService.createClass.mockRejectedValue(new Error("Error"));

    const response = await request(app).post("/api/classes").send(classData);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error creating class.");
    expect(response.body.error.code).toBe("CREATE_CLASS_ERROR");
  });
});

describe("ClassController - deleteClass", () => {
  it("should return 400 if class ID is invalid", async () => {
    const classId = "invalidClassId";
    validationUtils.validateClassCode.mockReturnValue(false);

    const response = await request(app).delete(`/api/classes/${classId}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid class ID.");
    expect(response.body.error.code).toBe("INVALID_CLASS_ID");
  });

  it("should return 404 if class is not found", async () => {
    const classId = "validClassId";
    validationUtils.validateClassCode.mockReturnValue(true);
    classService.getClass.mockResolvedValue(null);

    const response = await request(app).delete(`/api/classes/${classId}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Class not found.");
    expect(response.body.error.code).toBe("CLASS_NOT_FOUND");
  });

  it("should return 403 if user is not authorized to delete the class", async () => {
    const classId = "validClassId";
    validationUtils.validateClassCode.mockReturnValue(true);
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "anotherUserId",
      },
    });

    const response = await request(app).delete(`/api/classes/${classId}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "You are not authorized to delete this class."
    );
    expect(response.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 200 if class is deleted successfully", async () => {
    const classId = "validClassId";
    validationUtils.validateClassCode.mockReturnValue(true);
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "userId",
      },
    });
    classService.deleteClass.mockResolvedValue(true);

    const response = await request(app).delete(`/api/classes/${classId}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Class deleted successfully.");
  });

  it("should return 500 if there is an error deleting the class", async () => {
    const classId = "validClassId";
    validationUtils.validateClassCode.mockReturnValue(true);
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "userId",
      },
    });
    classService.deleteClass.mockRejectedValue(new Error("Error"));

    const response = await request(app).delete(`/api/classes/${classId}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error deleting class.");
    expect(response.body.error.code).toBe("DELETE_CLASS_ERROR");
  });
});

describe("ClassController - renameClass", () => {
  it("should return 400 if class ID is invalid", async () => {
    const classId = "invalidClassId";
    const classData = { name: "New Class Name" };
    validationUtils.validateClassCode.mockReturnValue(false);

    const response = await request(app)
      .put(`/api/classes/${classId}/name`)
      .send(classData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid class ID.");
    expect(response.body.error.code).toBe("INVALID_CLASS_ID");
  });

  it("should return 400 if class name is invalid", async () => {
    const classId = "validClassId";
    const classData = { name: "" };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateClassName.mockReturnValue(false);

    const response = await request(app)
      .put(`/api/classes/${classId}/name`)
      .send(classData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid class name.");
    expect(response.body.error.code).toBe("INVALID_CLASS_NAME");
  });

  it("should return 404 if class is not found", async () => {
    const classId = "validClassId";
    const classData = { name: "New Class Name" };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateClassName.mockReturnValue(true);
    classService.getClass.mockResolvedValue(null);

    const response = await request(app)
      .put(`/api/classes/${classId}/name`)
      .send(classData);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Class not found.");
    expect(response.body.error.code).toBe("CLASS_NOT_FOUND");
  });

  it("should return 403 if user is not authorized to rename the class", async () => {
    const classId = "validClassId";
    const classData = { name: "New Class Name" };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateClassName.mockReturnValue(true);
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "anotherUserId",
      },
      admins: [],
    });

    const response = await request(app)
      .put(`/api/classes/${classId}/name`)
      .send(classData);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "You are not authorized to rename this class."
    );
    expect(response.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 200 if class is renamed successfully", async () => {
    const classId = "validClassId";
    const classData = { name: "New Class Name" };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateClassName.mockReturnValue(true);
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "userId",
      },
      admins: [],
    });
    classService.renameClass.mockResolvedValue(classData);

    const response = await request(app)
      .put(`/api/classes/${classId}/name`)
      .send(classData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Class renamed successfully.");
    expect(response.body.data).toEqual(classData);
  });

  it("should return 500 if there is an error renaming the class", async () => {
    const classId = "validClassId";
    const classData = { name: "New Class Name" };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateClassName.mockReturnValue(true);
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "userId",
      },
      admins: [],
    });
    classService.renameClass.mockRejectedValue(new Error("Error"));

    const response = await request(app)
      .put(`/api/classes/${classId}/name`)
      .send(classData);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error renaming class.");
    expect(response.body.error.code).toBe("RENAME_CLASS_ERROR");
  });
});

describe("ClassController - getClasses", () => {
  it("should return 200 and classes if user has classes", async () => {
    const classes = [
      { name: "Class 1", teacher: "userId" },
      { name: "Class 2", teacher: "userId" },
    ];
    classService.getClasses.mockResolvedValue(classes);

    const response = await request(app).get("/api/classes");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Classes retrieved successfully.");
    expect(response.body.data).toEqual(classes);
  });

  it("should return 200 and empty array if user has no classes", async () => {
    classService.getClasses.mockResolvedValue([]);

    const response = await request(app).get("/api/classes");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Classes retrieved successfully.");
    expect(response.body.data).toEqual([]);
  });

  it("should return 500 if there is an error retrieving classes", async () => {
    classService.getClasses.mockRejectedValue(new Error("Error"));

    const response = await request(app).get("/api/classes");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error getting classes.");
    expect(response.body.error.code).toBe("GET_CLASSES_ERROR");
  });
});

describe("ClassController - addAdmin", () => {
  it("should return 400 if class ID is invalid", async () => {
    const classId = "invalidClassId";
    const adminData = { userId: "validUserId" };
    validationUtils.validateClassCode.mockReturnValue(false);

    const response = await request(app)
      .post(`/api/classes/${classId}/admins`)
      .send(adminData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid class ID.");
    expect(response.body.error.code).toBe("INVALID_CLASS_ID");
  });

  it("should return 404 if user is not found", async () => {
    const classId = "validClassId";
    const adminData = { userId: "validUserId" };
    validationUtils.validateClassCode.mockReturnValue(true);
    userService.getUserById.mockResolvedValue(null);

    const response = await request(app)
      .post(`/api/classes/${classId}/admins`)
      .send(adminData);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found.");
    expect(response.body.error.code).toBe("USER_NOT_FOUND");
  });

  it("should return 404 if class is not found", async () => {
    const classId = "validClassId";
    const adminData = { userId: "validUserId" };
    validationUtils.validateClassCode.mockReturnValue(true);
    userService.getUserById.mockResolvedValue({ _id: "validUserId" });
    classService.getClass.mockResolvedValue(null);

    const response = await request(app)
      .post(`/api/classes/${classId}/admins`)
      .send(adminData);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Class not found.");
    expect(response.body.error.code).toBe("CLASS_NOT_FOUND");
  });

  it("should return 403 if user is not authorized to add an admin", async () => {
    const classId = "validClassId";
    const adminData = { userId: "validUserId" };
    validationUtils.validateClassCode.mockReturnValue(true);
    userService.getUserById.mockResolvedValue({ _id: "validUserId" });
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "anotherUserId",
      },
    });

    const response = await request(app)
      .post(`/api/classes/${classId}/admins`)
      .send(adminData);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "You are not authorized to add an admin to this class."
    );
    expect(response.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 200 if admin is added successfully", async () => {
    const classId = "validClassId";
    const adminData = { userId: "validUserId" };
    validationUtils.validateClassCode.mockReturnValue(true);
    userService.getUserById.mockResolvedValue({ _id: "validUserId" });
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "userId",
      },
    });
    classService.addAdmin.mockResolvedValue({ ...adminData, classId });

    const response = await request(app)
      .post(`/api/classes/${classId}/admins`)
      .send(adminData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Admin added successfully.");
    expect(response.body.data).toEqual({ ...adminData, classId });
  });

  it("should return 500 if there is an error adding the admin", async () => {
    const classId = "validClassId";
    const adminData = { userId: "validUserId" };
    validationUtils.validateClassCode.mockReturnValue(true);
    userService.getUserById.mockResolvedValue({ _id: "validUserId" });
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "userId",
      },
    });
    classService.addAdmin.mockRejectedValue(new Error("Error"));

    const response = await request(app)
      .post(`/api/classes/${classId}/admins`)
      .send(adminData);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error adding admin.");
    expect(response.body.error.code).toBe("ADD_ADMIN_ERROR");
  });
});

describe("ClassController - removeAdmin", () => {
  it("should return 400 if class ID is invalid", async () => {
    const classId = "invalidClassId";
    const adminData = { userId: "validUserId" };
    validationUtils.validateClassCode.mockReturnValue(false);

    const response = await request(app)
      .delete(`/api/classes/${classId}/admins`)
      .send(adminData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid class ID.");
    expect(response.body.error.code).toBe("INVALID_CLASS_ID");
  });

  it("should return 404 if user is not found", async () => {
    const classId = "validClassId";
    const adminData = { userId: "validUserId" };
    validationUtils.validateClassCode.mockReturnValue(true);
    userService.getUserById.mockResolvedValue(null);

    const response = await request(app)
      .delete(`/api/classes/${classId}/admins`)
      .send(adminData);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found.");
    expect(response.body.error.code).toBe("USER_NOT_FOUND");
  });

  it("should return 404 if class is not found", async () => {
    const classId = "validClassId";
    const adminData = { userId: "validUserId" };
    validationUtils.validateClassCode.mockReturnValue(true);
    userService.getUserById.mockResolvedValue({ _id: "validUserId" });
    classService.getClass.mockResolvedValue(null);

    const response = await request(app)
      .delete(`/api/classes/${classId}/admins`)
      .send(adminData);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Class not found.");
    expect(response.body.error.code).toBe("CLASS_NOT_FOUND");
  });

  it("should return 403 if user is not authorized to remove an admin", async () => {
    const classId = "validClassId";
    const adminData = { userId: "validUserId" };
    validationUtils.validateClassCode.mockReturnValue(true);
    userService.getUserById.mockResolvedValue({ _id: "validUserId" });
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "anotherUserId",
      },
    });

    const response = await request(app)
      .delete(`/api/classes/${classId}/admins`)
      .send(adminData);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "You are not authorized to remove an admin from this class."
    );
    expect(response.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 200 if admin is removed successfully", async () => {
    const classId = "validClassId";
    const adminData = { userId: "validUserId" };
    validationUtils.validateClassCode.mockReturnValue(true);
    userService.getUserById.mockResolvedValue({ _id: "validUserId" });
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "userId",
      },
    });
    classService.removeAdmin.mockResolvedValue({ ...adminData, classId });

    const response = await request(app)
      .delete(`/api/classes/${classId}/admins`)
      .send(adminData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Admin removed successfully.");
    expect(response.body.data).toEqual({ ...adminData, classId });
  });

  it("should return 500 if there is an error removing the admin", async () => {
    const classId = "validClassId";
    const adminData = { userId: "validUserId" };
    validationUtils.validateClassCode.mockReturnValue(true);
    userService.getUserById.mockResolvedValue({ _id: "validUserId" });
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "userId",
      },
    });
    classService.removeAdmin.mockRejectedValue(new Error("Error"));

    const response = await request(app)
      .delete(`/api/classes/${classId}/admins`)
      .send(adminData);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error removing admin.");
    expect(response.body.error.code).toBe("REMOVE_ADMIN_ERROR");
  });
});

describe("ClassController - addStudent", () => {
  it("should return 400 if class ID is invalid", async () => {
    const classId = "invalidClassId";
    const studentData = { name: "Student Name" };
    validationUtils.validateClassCode.mockReturnValue(false);

    const response = await request(app)
      .post(`/api/classes/${classId}/students`)
      .send(studentData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid class ID.");
    expect(response.body.error.code).toBe("INVALID_CLASS_ID");
  });

  it("should return 400 if student name is invalid", async () => {
    const classId = "validClassId";
    const studentData = { name: "" };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateStudentName.mockReturnValue(false);

    const response = await request(app)
      .post(`/api/classes/${classId}/students`)
      .send(studentData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid student name.");
    expect(response.body.error.code).toBe("INVALID_STUDENT_NAME");
  });

  it("should return 404 if class is not found", async () => {
    const classId = "validClassId";
    const studentData = { name: "Student Name" };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateStudentName.mockReturnValue(true);
    classService.getClass.mockResolvedValue(null);

    const response = await request(app)
      .post(`/api/classes/${classId}/students`)
      .send(studentData);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Class not found.");
    expect(response.body.error.code).toBe("CLASS_NOT_FOUND");
  });

  it("should return 403 if user is not authorized to add a student", async () => {
    const classId = "validClassId";
    const studentData = { name: "Student Name" };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateStudentName.mockReturnValue(true);
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "anotherUserId",
      },
      admins: [],
    });

    const response = await request(app)
      .post(`/api/classes/${classId}/students`)
      .send(studentData);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "You are not authorized to add a student to this class."
    );
    expect(response.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 200 if student is added successfully", async () => {
    const classId = "validClassId";
    const studentData = { name: "Student Name" };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateStudentName.mockReturnValue(true);
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "userId",
      },
      admins: [],
    });
    classService.addStudent.mockResolvedValue({ ...studentData, classId });

    const response = await request(app)
      .post(`/api/classes/${classId}/students`)
      .send(studentData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Student added successfully.");
    expect(response.body.data).toEqual({ ...studentData, classId });
  });

  it("should return 500 if there is an error adding the student", async () => {
    const classId = "validClassId";
    const studentData = { name: "Student Name" };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateStudentName.mockReturnValue(true);
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "userId",
      },
      admins: [],
    });
    classService.addStudent.mockRejectedValue(new Error("Error"));

    const response = await request(app)
      .post(`/api/classes/${classId}/students`)
      .send(studentData);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error adding student.");
    expect(response.body.error.code).toBe("ADD_STUDENT_ERROR");
  });
});

describe("ClassController - renameStudent", () => {
  it("should return 400 if class ID is invalid", async () => {
    const classId = "invalidClassId";
    const studentNumber = 1;
    const studentData = { name: "New Student Name" };
    validationUtils.validateClassCode.mockReturnValue(false);

    const response = await request(app)
      .put(`/api/classes/${classId}/students/${studentNumber}`)
      .send(studentData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid class ID.");
    expect(response.body.error.code).toBe("INVALID_CLASS_ID");
  });

  it("should return 400 if student number is invalid", async () => {
    const classId = "validClassId";
    const studentNumber = "invalidStudentNumber";
    const studentData = { name: "New Student Name" };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateStudentNumber.mockReturnValue(false);

    const response = await request(app)
      .put(`/api/classes/${classId}/students/${studentNumber}`)
      .send(studentData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid student number.");
    expect(response.body.error.code).toBe("INVALID_STUDENT_NUMBER");
  });

  it("should return 400 if student name is invalid", async () => {
    const classId = "validClassId";
    const studentNumber = 1;
    const studentData = { name: "" };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateStudentNumber.mockReturnValue(true);
    validationUtils.validateStudentName.mockReturnValue(false);

    const response = await request(app)
      .put(`/api/classes/${classId}/students/${studentNumber}`)
      .send(studentData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid student name.");
    expect(response.body.error.code).toBe("INVALID_STUDENT_NAME");
  });

  it("should return 404 if class is not found", async () => {
    const classId = "validClassId";
    const studentNumber = 1;
    const studentData = { name: "New Student Name" };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateStudentNumber.mockReturnValue(true);
    validationUtils.validateStudentName.mockReturnValue(true);
    classService.getClass.mockResolvedValue(null);

    const response = await request(app)
      .put(`/api/classes/${classId}/students/${studentNumber}`)
      .send(studentData);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Class not found.");
    expect(response.body.error.code).toBe("CLASS_NOT_FOUND");
  });

  it("should return 403 if user is not authorized to rename the student", async () => {
    const classId = "validClassId";
    const studentNumber = 1;
    const studentData = { name: "New Student Name" };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateStudentNumber.mockReturnValue(true);
    validationUtils.validateStudentName.mockReturnValue(true);
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "anotherUserId",
      },
      admins: [],
    });

    const response = await request(app)
      .put(`/api/classes/${classId}/students/${studentNumber}`)
      .send(studentData);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "You are not authorized to rename a student in this class."
    );
    expect(response.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 200 if student is renamed successfully", async () => {
    const classId = "validClassId";
    const studentNumber = 1;
    const studentData = { name: "New Student Name" };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateStudentNumber.mockReturnValue(true);
    validationUtils.validateStudentName.mockReturnValue(true);
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "userId",
      },
      admins: [],
    });
    classService.renameStudent.mockResolvedValue(studentData);

    const response = await request(app)
      .put(`/api/classes/${classId}/students/${studentNumber}`)
      .send(studentData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Student renamed successfully.");
    expect(response.body.data).toEqual(studentData);
  });

  it("should return 500 if there is an error renaming the student", async () => {
    const classId = "validClassId";
    const studentNumber = 1;
    const studentData = { name: "New Student Name" };
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateStudentNumber.mockReturnValue(true);
    validationUtils.validateStudentName.mockReturnValue(true);
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "userId",
      },
      admins: [],
    });
    classService.renameStudent.mockRejectedValue(new Error("Error"));

    const response = await request(app)
      .put(`/api/classes/${classId}/students/${studentNumber}`)
      .send(studentData);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error renaming student.");
    expect(response.body.error.code).toBe("RENAME_STUDENT_ERROR");
  });
});

describe("ClassController - deleteStudent", () => {
  it("should return 400 if class ID is invalid", async () => {
    const classId = "invalidClassId";
    const studentNumber = 1;
    validationUtils.validateClassCode.mockReturnValue(false);

    const response = await request(app).delete(
      `/api/classes/${classId}/students/${studentNumber}`
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid class ID.");
    expect(response.body.error.code).toBe("INVALID_CLASS_ID");
  });

  it("should return 400 if student number is invalid", async () => {
    const classId = "validClassId";
    const studentNumber = "invalidStudentNumber";
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateStudentNumber.mockReturnValue(false);

    const response = await request(app).delete(
      `/api/classes/${classId}/students/${studentNumber}`
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid student number.");
    expect(response.body.error.code).toBe("INVALID_STUDENT_NUMBER");
  });

  it("should return 404 if class is not found", async () => {
    const classId = "validClassId";
    const studentNumber = 1;
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateStudentNumber.mockReturnValue(true);
    classService.getClass.mockResolvedValue(null);

    const response = await request(app).delete(
      `/api/classes/${classId}/students/${studentNumber}`
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Class not found.");
    expect(response.body.error.code).toBe("CLASS_NOT_FOUND");
  });

  it("should return 403 if user is not authorized to delete the student", async () => {
    const classId = "validClassId";
    const studentNumber = 1;
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateStudentNumber.mockReturnValue(true);
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "anotherUserId",
      },
      admins: [],
    });

    const response = await request(app).delete(
      `/api/classes/${classId}/students/${studentNumber}`
    );

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "You are not authorized to delete a student from this class."
    );
    expect(response.body.error.code).toBe("ACCESS_DENIED");
  });

  it("should return 200 if student is deleted successfully", async () => {
    const classId = "validClassId";
    const studentNumber = 1;
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateStudentNumber.mockReturnValue(true);
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "userId",
      },
      admins: [],
    });
    classService.deleteStudent.mockResolvedValue(true);

    const response = await request(app).delete(
      `/api/classes/${classId}/students/${studentNumber}`
    );

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Student deleted successfully.");
  });

  it("should return 500 if there is an error deleting the student", async () => {
    const classId = "validClassId";
    const studentNumber = 1;
    validationUtils.validateClassCode.mockReturnValue(true);
    validationUtils.validateStudentNumber.mockReturnValue(true);
    classService.getClass.mockResolvedValue({
      teacher: {
        _id: "userId",
      },
      admins: [],
    });
    classService.deleteStudent.mockRejectedValue(new Error("Error"));

    const response = await request(app).delete(
      `/api/classes/${classId}/students/${studentNumber}`
    );

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error deleting student.");
    expect(response.body.error.code).toBe("DELETE_STUDENT_ERROR");
  });
});
