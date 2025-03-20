const express = require('express');
const { ObjectId } = require('mongodb');
const { auth, requireRole } = require('../middleware/auth');

module.exports = function (db) {
  const router = express.Router();
  const batches = db.collection("batches");
  const students = db.collection("students");

  // Helper function to generate batch ID
  async function generateBatchId() {
    const lastBatch = await batches
      .find()
      .sort({ _id: -1 })
      .limit(1)
      .toArray();

    let number = 1;
    if (lastBatch.length > 0 && lastBatch[0].batchId) {
      const lastNumber = parseInt(lastBatch[0].batchId.replace('BATCH', ''));
      number = lastNumber + 1;
    }

    return `BATCH${number.toString().padStart(4, '0')}`;
  }

  // Create a new batch
  router.post('/', auth, requireRole('institute'), async (req, res) => {
    try {
      const { name, description, startDate, endDate, courseId, instituteId } = req.body;
      
      if (!name || !startDate || !endDate || !courseId || !instituteId) {
        return res.status(400).json({ error: "Required fields missing" });
      }

      // Verify the institute is creating a batch for their own institute
      if (req.user.instituteId !== instituteId) {
        return res.status(403).json({ error: "Access denied. You can only create batches for your own institute." });
      }

      const batchId = await generateBatchId();

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
      res.status(201).json({ 
        message: "Batch created successfully", 
        batchId
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get all batches for an institute
  router.get('/institute/:instituteId', auth, requireRole('institute'), async (req, res) => {
    try {
      const { instituteId } = req.params;

      // Verify the institute is accessing their own batches
      if (req.user.instituteId !== instituteId) {
        return res.status(403).json({ error: "Access denied. You can only access your own institute's batches." });
      }

      const instituteBatches = await batches.find({ instituteId }).toArray();
      res.status(200).json(instituteBatches);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get specific batch with students
  router.get('/:batchId', auth, async (req, res) => {
    try {
      const batch = await batches.findOne({ batchId: req.params.batchId });

      if (!batch) {
        return res.status(404).json({ error: "Batch not found" });
      }

      // Verify access rights
      if (req.user.roles.includes('institute')) {
        if (req.user.instituteId !== batch.instituteId) {
          return res.status(403).json({ error: "Access denied. You can only access your own institute's batches." });
        }
      } else if (req.user.roles.includes('student')) {
        if (!batch.students.includes(req.user.studentId)) {
          return res.status(403).json({ error: "Access denied. You can only access batches you are enrolled in." });
        }
      }

      const studentDetails = await students
        .find({ studentId: { $in: batch.students } })
        .project({ password: 0 })
        .toArray();

      batch.studentDetails = studentDetails;
      res.status(200).json(batch);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update batch
  router.put('/:batchId', auth, requireRole('institute'), async (req, res) => {
    try {
      const batch = await batches.findOne({ batchId: req.params.batchId });
      if (!batch) {
        return res.status(404).json({ error: "Batch not found" });
      }

      // Verify the institute is updating their own batch
      if (req.user.instituteId !== batch.instituteId) {
        return res.status(403).json({ error: "Access denied. You can only update your own institute's batches." });
      }

      const { name, description, startDate, endDate, courseId } = req.body;
      const updateData = {
        ...(name && { name }),
        ...(description && { description }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(courseId && { courseId }),
        updatedAt: new Date()
      };

      const result = await batches.updateOne(
        { batchId: req.params.batchId },
        { $set: updateData }
      );

      res.status(200).json({ message: "Batch updated successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete batch
  router.delete('/:batchId', auth, requireRole('institute'), async (req, res) => {
    try {
      const batch = await batches.findOne({ batchId: req.params.batchId });
      if (!batch) {
        return res.status(404).json({ error: "Batch not found" });
      }

      // Verify the institute is deleting their own batch
      if (req.user.instituteId !== batch.instituteId) {
        return res.status(403).json({ error: "Access denied. You can only delete your own institute's batches." });
      }

      // Remove batch from all students
      await students.updateMany(
        { studentId: { $in: batch.students } },
        { $pull: { batches: batch.batchId } }
      );

      // Delete the batch
      await batches.deleteOne({ batchId: req.params.batchId });

      res.status(200).json({ message: "Batch deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add student to batch
  router.post('/:batchId/students', auth, requireRole('institute'), async (req, res) => {
    try {
      const { batchId } = req.params;
      const { studentId } = req.body;

      const batch = await batches.findOne({ batchId });
      if (!batch) {
        return res.status(404).json({ error: "Batch not found" });
      }

      // Verify the institute is managing their own batch
      if (req.user.instituteId !== batch.instituteId) {
        return res.status(403).json({ error: "Access denied. You can only manage your own institute's batches." });
      }

      const student = await students.findOne({ studentId });
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
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

      res.status(200).json({ message: "Student added to batch successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Remove student from batch
  router.delete('/:batchId/students/:studentId', auth, requireRole('institute'), async (req, res) => {
    try {
      const { batchId, studentId } = req.params;

      const batch = await batches.findOne({ batchId });
      if (!batch) {
        return res.status(404).json({ error: "Batch not found" });
      }

      // Verify the institute is managing their own batch
      if (req.user.instituteId !== batch.instituteId) {
        return res.status(403).json({ error: "Access denied. You can only manage your own institute's batches." });
      }

      // Remove student from batch
      await batches.updateOne(
        { batchId },
        { $pull: { students: studentId } }
      );

      // Remove batch from student's batches
      await students.updateOne(
        { studentId },
        { $pull: {batches: batchId } }
      );

      res.status(200).json({ message: "Student removed from batch successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};