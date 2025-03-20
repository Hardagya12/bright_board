const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { auth, requireRole } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || "e!3@B1y#i9$u&8mNpXz2LqA0V";

module.exports = function (db) {
  const router = express.Router();
  const students = db.collection("students");
  const institutes = db.collection("institutes");
  const batches = db.collection("batches");

  // Helper function to generate student ID
  async function generateStudentId() {
    const lastStudent = await students
      .find()
      .sort({ _id: -1 })
      .limit(1)
      .toArray();

    let number = 1;
    if (lastStudent.length > 0 && lastStudent[0].studentId) {
      const lastNumber = parseInt(lastStudent[0].studentId.replace('STU', ''));
      number = lastNumber + 1;
    }

    return `STU${number.toString().padStart(4, '0')}`;
  }

  // Student signup
  router.post('/signup', async (req, res) => {
    try {
      const { name, email, password, instituteId, contactNumber, address } = req.body;

      if (!name || !email || !password || !instituteId || !contactNumber || !address) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const existingStudent = await students.findOne({ email });
      if (existingStudent) {
        return res.status(400).json({ error: "Student already exists with this email" });
      }

      const institute = await institutes.findOne({ instituteId });
      if (!institute) {
        return res.status(400).json({ error: "Invalid Institute ID" });
      }

      const studentId = await generateStudentId();
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

      const token = jwt.sign(
        { 
          studentId,
          email,
          name,
          instituteId,
          roles: ["student"]
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({ 
        message: "Student registered successfully", 
        studentId,
        token
      });
    } catch (err) {
      res.status(500).json({ error: "Error registering student: " + err.message });
    }
  });

  // Student signin
  router.post('/signin', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const student = await students.findOne({ email });
      if (!student || student.status !== "Active") {
        return res.status(400).json({ error: "Invalid email or account not activated" });
      }

      const isPasswordValid = await bcrypt.compare(password, student.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign(
        { 
          studentId: student.studentId,
          email: student.email,
          name: student.name,
          instituteId: student.instituteId,
          roles: ["student"]
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(200).json({ 
        message: "Login successful", 
        token,
        studentId: student.studentId,
        name: student.name,
        instituteId: student.instituteId,
        roles: ["student"]
      });
    } catch (err) {
      res.status(500).json({ error: "Error logging in: " + err.message });
    }
  });

  // Get student profile
  router.get('/:studentId', auth, requireRole('student'), async (req, res) => {
    try {
      const { studentId } = req.params;

      // Verify the student is accessing their own data
      if (req.user.studentId !== studentId) {
        return res.status(403).json({ error: "Access denied. You can only access your own data." });
      }

      const student = await students.findOne({ studentId });
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Get batch details
      const studentBatches = await batches
        .find({ batchId: { $in: student.batches } })
        .toArray();

      const { password, ...studentData } = student;
      res.status(200).json({
        ...studentData,
        batchDetails: studentBatches
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update student profile
  router.put('/:studentId', auth, requireRole('student'), async (req, res) => {
    try {
      const { studentId } = req.params;

      // Verify the student is updating their own data
      if (req.user.studentId !== studentId) {
        return res.status(403).json({ error: "Access denied. You can only update your own data." });
      }

      const { name, contactNumber, address } = req.body;

      const updateData = {
        ...(name && { name }),
        ...(contactNumber && { contactNumber }),
        ...(address && { address }),
        updatedAt: new Date()
      };

      const result = await students.updateOne(
        { studentId },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Student not found" });
      }

      res.status(200).json({ message: "Profile updated successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Join batch
  router.post('/:studentId/join-batch', auth, requireRole('student'), async (req, res) => {
    try {
      const { studentId } = req.params;
      const { batchId } = req.body;

      // Verify the student is joining a batch for themselves
      if (req.user.studentId !== studentId) {
        return res.status(403).json({ error: "Access denied. You can only join batches for yourself." });
      }

      const batch = await batches.findOne({ batchId });
      if (!batch) {
        return res.status(404).json({ error: "Batch not found" });
      }

      // Add student to batch
      await batches.updateOne(
        { batchId },
        { $addToSet: { students: studentId } }
      );

      // Add batch to student's batches
      await students.updateOne(
        { studentId },
        { $addToSet: { batches: batchId } }
      );

      res.status(200).json({ message: "Successfully joined batch" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};