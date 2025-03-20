const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { auth, requireRole } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || "e!3@B1y#i9$u&8mNpXz2LqA0V";

module.exports = function (db) {
  const router = express.Router();
  const institutes = db.collection("institutes");
  const batches = db.collection("batches");
  const students = db.collection("students");
  const courses = db.collection("courses");

// Helper function to generate unique IDs
async function generateId(collection, prefix) {
  const lastDoc = await collection
      .find({})
      .sort({ instituteId: -1 }) // Sort in descending order
      .limit(1)
      .toArray();

  let number = 1;
  if (lastDoc.length > 0) {
      const lastId = lastDoc[0].instituteId;
      const match = lastId.match(/\d+/); // Extract numeric part
      if (match) {
          number = parseInt(match[0]) + 1;
      }
  }

  return `${prefix}${number.toString().padStart(4, '0')}`;
}

  // Institute CRUD Operations
  router.post('/', async (req, res) => {
    try {
      const { name, address, contactNumber, email, password } = req.body;
      
      if (!name || !address || !contactNumber || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const existingInstitute = await institutes.findOne({ email });
      if (existingInstitute) {
        return res.status(400).json({ error: "Institute with this email already exists" });
      }

      const instituteId = await generateId(institutes, 'INST');
      const hashedPassword = await bcrypt.hash(password, 10);

      const newInstitute = {
        instituteId,
        name,
        address,
        contactNumber,
        email,
        password: hashedPassword,
        students: [],
        batches: [],
        courses: [],
        roles: ["institute"],
        createdAt: new Date(),
        status: "Active"
      };

      await institutes.insertOne(newInstitute);

      const token = jwt.sign(
        { 
          instituteId,
          email,
          name,
          roles: ["institute"]
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({ 
        message: "Institute created successfully", 
        instituteId,
        token 
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Institute login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const institute = await institutes.findOne({ email });
      if (!institute || institute.status !== "Active") {
        return res.status(400).json({ error: "Invalid email or institute not active" });
      }

      const isPasswordValid = await bcrypt.compare(password, institute.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign(
        { 
          instituteId: institute.instituteId,
          email: institute.email,
          name: institute.name,
          roles: ["institute"]
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(200).json({
        message: "Login successful",
        token,
        instituteId: institute.instituteId,
        name: institute.name,
        roles: ["institute"]
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get all institutes
  router.get('/', async (req, res) => {
    try {
      const allInstitutes = await institutes.find().project({ password: 0 }).toArray();
      res.status(200).json(allInstitutes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get specific institute
  router.get('/:instituteId', auth, requireRole('institute'), async (req, res) => {
    try {
      const { instituteId } = req.params;

      // Verify the institute is accessing their own data
      if (req.user.instituteId !== instituteId) {
        return res.status(403).json({ error: "Access denied. You can only access your own institute data." });
      }

      const institute = await institutes.findOne({ instituteId });
      if (!institute) {
        return res.status(404).json({ error: "Institute not found" });
      }

      // Get all related data
      const instituteStudents = await students
        .find({ instituteId })
        .project({ password: 0 })
        .toArray();

      const instituteBatches = await batches
        .find({ instituteId })
        .toArray();

      const instituteCourses = await courses
        .find({ instituteId })
        .toArray();

      const { password, ...instituteData } = institute;

      res.status(200).json({
        ...instituteData,
        studentDetails: instituteStudents,
        batchDetails: instituteBatches,
        courseDetails: instituteCourses
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update institute
  router.put('/:instituteId', auth, requireRole('institute'), async (req, res) => {
    try {
      const { instituteId } = req.params;

      // Verify the institute is updating their own data
      if (req.user.instituteId !== instituteId) {
        return res.status(403).json({ error: "Access denied. You can only update your own institute data." });
      }

      const { name, address, contactNumber } = req.body;

      const updateData = {
        ...(name && { name }),
        ...(address && { address }),
        ...(contactNumber && { contactNumber }),
        updatedAt: new Date()
      };

      const result = await institutes.updateOne(
        { instituteId },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Institute not found" });
      }

      res.status(200).json({ message: "Institute updated successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Student Management
  router.post('/:instituteId/students', auth, requireRole('institute'), async (req, res) => {
    try {
      const { instituteId } = req.params;

      // Verify the institute is adding students to their own institute
      if (req.user.instituteId !== instituteId) {
        return res.status(403).json({ error: "Access denied. You can only add students to your own institute." });
      }

      const { name, email, password, contactNumber, address } = req.body;

      if (!name || !email || !password || !contactNumber || !address) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const studentId = await generateId(students, 'STU');
      const hashedPassword = await bcrypt.hash(password, 10);

      const newStudent = {
        studentId,
        name,
        email,
        password: hashedPassword,
        instituteId,
        contactNumber,
        address,
        roles: ["student"],
        batches: [],
        createdAt: new Date(),
        status: "Active"
      };

      await students.insertOne(newStudent);
      
      // Update institute's students array
      await institutes.updateOne(
        { instituteId },
        { $push: { students: studentId } }
      );

      res.status(201).json({ 
        message: "Student created successfully", 
        studentId
      });
    } catch (err) {
      res.status(500).json({ error: "Error creating student: " + err.message });
    }
  });

  // Batch Management
  router.post('/:instituteId/batches', auth, requireRole('institute'), async (req, res) => {
    try {
      const { instituteId } = req.params;

      // Verify the institute is creating batches for their own institute
      if (req.user.instituteId !== instituteId) {
        return res.status(403).json({ error: "Access denied. You can only create batches for your own institute." });
      }

      const { name, description, startDate, endDate, courseId } = req.body;

      if (!name || !startDate || !endDate || !courseId) {
        return res.status(400).json({ error: "Required fields missing" });
      }

      const batchId = await generateId(batches, 'BATCH');

      const newBatch = {
        batchId,
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        courseId,
        instituteId,
        students: [],
        createdAt: new Date(),
        status: "Active"
      };

      await batches.insertOne(newBatch);
      
      // Update institute's batches array
      await institutes.updateOne(
        { instituteId },
        { $push: { batches: batchId } }
      );

      res.status(201).json({ 
        message: "Batch created successfully", 
        batchId
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Course Management
  router.post('/:instituteId/courses', auth, requireRole('institute'), async (req, res) => {
    try {
      const { instituteId } = req.params;

      // Verify the institute is creating courses for their own institute
      if (req.user.instituteId !== instituteId) {
        return res.status(403).json({ error: "Access denied. You can only create courses for your own institute." });
      }

      const { name, description, duration } = req.body;

      if (!name || !duration) {
        return res.status(400).json({ error: "Name and duration are required" });
      }

      const courseId = await generateId(courses, 'COURSE');

      const newCourse = {
        courseId,
        name,
        description,
        duration,
        instituteId,
        createdAt: new Date(),
        status: "Active"
      };

      await courses.insertOne(newCourse);
      
      // Update institute's courses array
      await institutes.updateOne(
        { instituteId },
        { $push: { courses: courseId } }
      );

      res.status(201).json({ 
        message: "Course created successfully", 
        courseId 
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};