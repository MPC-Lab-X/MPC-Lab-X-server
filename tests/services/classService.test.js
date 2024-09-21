/**
 * @file tests/services/classService.test.js
 * @description Tests for the class service functions.
 */

const Class = require("../../src/models/classSchema");
const classService = require("../../src/services/classService");
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
  await Class.deleteMany({});
});

describe("Class Service", () => {
  describe("createClass", () => {
    it("should create a new class successfully", async () => {
      const classData = {
        name: "Math 101",
        teacher: new mongoose.Types.ObjectId(),
        admins: [new mongoose.Types.ObjectId()],
      };
      const newClass = await classService.createClass(classData);
      expect(newClass._id).toBeDefined();
      expect(newClass._id).toMatch(/^[A-Z0-9]{6}$/);
      expect(newClass.name).toBe(classData.name);
      expect(newClass.teacher).toEqual(classData.teacher);
      expect(newClass.admins).toEqual(classData.admins);
    });

    it("should throw an error if class creation fails", async () => {
      const classData = { name: "Math 101" };
      await expect(classService.createClass(classData)).rejects.toThrow();
    });
  });

  describe("getClass", () => {
    it("should retrieve a class by ID successfully", async () => {
      const classData = {
        name: "Science 101",
        teacher: new mongoose.Types.ObjectId(),
        admins: [new mongoose.Types.ObjectId()],
      };
      const newClass = await classService.createClass(classData);
      const retrievedClass = await classService.getClass(newClass._id);
      expect(retrievedClass).toBeDefined();
      expect(retrievedClass._id).toEqual(newClass._id);
      expect(retrievedClass.name).toBe(classData.name);
      expect(retrievedClass.teacher).toEqual(classData.teacher);
      expect(retrievedClass.admins).toEqual(classData.admins);
    });

    it("should return null if class does not exist", async () => {
      const nonExistentClassId = new mongoose.Types.ObjectId();
      const result = await classService.getClass(nonExistentClassId);
      expect(result).toBeNull();
    });
  });

  describe("renameClass", () => {
    it("should rename a class successfully", async () => {
      const classData = {
        name: "History 101",
        teacher: new mongoose.Types.ObjectId(),
        admins: [new mongoose.Types.ObjectId()],
      };
      const newClass = await classService.createClass(classData);
      const updatedClass = await classService.renameClass(
        newClass._id,
        "History 102"
      );
      expect(updatedClass).toBeDefined();
      expect(updatedClass._id).toEqual(newClass._id);
      expect(updatedClass.name).toBe("History 102");
    });

    it("should return null if class does not exist", async () => {
      const nonExistentClassId = new mongoose.Types.ObjectId();
      const result = await classService.renameClass(
        nonExistentClassId,
        "History 102"
      );
      expect(result).toBeNull();
    });
  });

  describe("addAdmin", () => {
    it("should add an admin to a class successfully", async () => {
      const classData = {
        name: "Physics 101",
        teacher: new mongoose.Types.ObjectId(),
        admins: [],
      };
      const newClass = await classService.createClass(classData);
      const adminId = new mongoose.Types.ObjectId();
      const updatedClass = await classService.addAdmin(newClass._id, adminId);
      expect(updatedClass).toBeDefined();
      expect(updatedClass.admins).toContainEqual(adminId);
    });

    it("should throw an error if user ID is invalid", async () => {
      const classData = {
        name: "Chemistry 101",
        teacher: new mongoose.Types.ObjectId(),
        admins: [],
      };
      const newClass = await classService.createClass(classData);
      const invalidUserId = "invalidUserId";
      await expect(
        classService.addAdmin(newClass._id, invalidUserId)
      ).rejects.toThrow("Invalid user ID");
    });

    it("should return null if class does not exist", async () => {
      const nonExistentClassId = new mongoose.Types.ObjectId();
      const adminId = new mongoose.Types.ObjectId();
      const result = await classService.addAdmin(nonExistentClassId, adminId);
      expect(result).toBeNull();
    });
  });

  describe("removeAdmin", () => {
    it("should remove an admin from a class successfully", async () => {
      const classData = {
        name: "Biology 101",
        teacher: new mongoose.Types.ObjectId(),
        admins: [new mongoose.Types.ObjectId()],
      };
      const newClass = await classService.createClass(classData);
      const adminId = newClass.admins[0];
      const updatedClass = await classService.removeAdmin(
        newClass._id,
        adminId
      );
      expect(updatedClass).toBeDefined();
      expect(updatedClass.admins).not.toContainEqual(adminId);
    });

    it("should throw an error if user ID is invalid", async () => {
      const classData = {
        name: "Geography 101",
        teacher: new mongoose.Types.ObjectId(),
        admins: [new mongoose.Types.ObjectId()],
      };
      const newClass = await classService.createClass(classData);
      const invalidUserId = "invalidUserId";
      await expect(
        classService.removeAdmin(newClass._id, invalidUserId)
      ).rejects.toThrow("Invalid user ID");
    });

    it("should return null if class does not exist", async () => {
      const nonExistentClassId = new mongoose.Types.ObjectId();
      const adminId = new mongoose.Types.ObjectId();
      const result = await classService.removeAdmin(
        nonExistentClassId,
        adminId
      );
      expect(result).toBeNull();
    });
  });

  describe("addStudent", () => {
    it("should add a student to a class successfully", async () => {
      const classData = {
        name: "Art 101",
        teacher: new mongoose.Types.ObjectId(),
        admins: [new mongoose.Types.ObjectId()],
        students: [],
      };
      const newClass = await classService.createClass(classData);
      const studentName = "John Doe";
      const updatedClass = await classService.addStudent(
        newClass._id,
        studentName
      );
      expect(updatedClass).toBeDefined();
      expect(updatedClass.students).toHaveLength(1);
      expect(updatedClass.students).toContainEqual(
        expect.objectContaining({
          deleted: false,
          name: studentName,
        })
      );
      expect(updatedClass.students[0].studentNumber).toBe(1);
    });

    it("should return null if class does not exist", async () => {
      const nonExistentClassId = new mongoose.Types.ObjectId();
      const studentName = "John Doe";
      const result = await classService.addStudent(
        nonExistentClassId,
        studentName
      );
      expect(result).toBeNull();
    });
  });

  describe("renameStudent", () => {
    it("should rename a student successfully", async () => {
      const classData = {
        name: "Music 101",
        teacher: new mongoose.Types.ObjectId(),
        admins: [new mongoose.Types.ObjectId()],
        students: [{ studentNumber: 12345, name: "Jane Doe" }],
      };
      const newClass = await classService.createClass(classData);
      const updatedClass = await classService.renameStudent(
        newClass._id,
        12345,
        "Jane Smith"
      );
      expect(updatedClass).toBeDefined();
      expect(updatedClass.students).toContainEqual(
        expect.objectContaining({
          studentNumber: 12345,
          name: "Jane Smith",
        })
      );
    });

    it("should return null if class does not exist", async () => {
      const nonExistentClassId = new mongoose.Types.ObjectId();
      const result = await classService.renameStudent(
        nonExistentClassId,
        12345,
        "Jane Smith"
      );
      expect(result).toBeNull();
    });

    it("should return null if student does not exist", async () => {
      const classData = {
        name: "Drama 101",
        teacher: new mongoose.Types.ObjectId(),
        admins: [new mongoose.Types.ObjectId()],
        students: [{ studentNumber: 12345, name: "Jane Doe" }],
      };
      const newClass = await classService.createClass(classData);
      const result = await classService.renameStudent(
        newClass._id,
        67890,
        "Jane Smith"
      );
      expect(result).toBeNull();
    });
  });

  describe("deleteStudent", () => {
    it("should soft delete a student successfully", async () => {
      const classData = {
        name: "Philosophy 101",
        teacher: new mongoose.Types.ObjectId(),
        admins: [new mongoose.Types.ObjectId()],
        students: [{ studentNumber: 12345, name: "Alice Doe" }],
      };
      const newClass = await classService.createClass(classData);
      const updatedClass = await classService.deleteStudent(
        newClass._id,
        12345
      );
      expect(updatedClass).toBeDefined();
      expect(updatedClass.students).toContainEqual(
        expect.objectContaining({
          studentNumber: 12345,
          name: "Alice Doe",
          deleted: true,
        })
      );
    });

    it("should return null if class does not exist", async () => {
      const nonExistentClassId = new mongoose.Types.ObjectId();
      const result = await classService.deleteStudent(
        nonExistentClassId,
        12345
      );
      expect(result).toBeNull();
    });
  });

  describe("deleteClass", () => {
    it("should soft delete a class successfully", async () => {
      const classData = {
        name: "Economics 101",
        teacher: new mongoose.Types.ObjectId(),
        admins: [new mongoose.Types.ObjectId()],
        students: [{ studentNumber: 12345, name: "Alice Doe" }],
      };
      const newClass = await classService.createClass(classData);
      const deleted = await classService.deleteClass(newClass._id);
      expect(deleted).toBeDefined();
      expect(deleted).toBe(true);
    });

    it("should return null if class does not exist", async () => {
      const nonExistentClassId = new mongoose.Types.ObjectId();
      const result = await classService.deleteClass(nonExistentClassId);
      expect(result).toBeNull();
    });
  });
});
