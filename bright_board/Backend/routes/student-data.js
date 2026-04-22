const express = require('express');
const { authenticate, requireStudent } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();
  const { ObjectId } = require('mongodb');
  const materials = db.collection('materials');
  const payments = db.collection('payments');
  const batches = db.collection('batches');
  const students = db.collection('students');
  const attendanceLogs = db.collection('attendance_logs');
  const feedback = db.collection('feedback');
  const supportTickets = db.collection('support_tickets');

  // ─── STUDENT BATCHES ───────────────────────────────────────────────────────
  router.get('/batches', authenticate, requireStudent, async (req, res) => {
    try {
      const instituteId = new ObjectId(req.user.instituteId);
      const studentId = new ObjectId(req.user.studentId);
      const student = await students.findOne({ _id: studentId, instituteId });
      if (!student) return res.status(404).json({ error: 'Student not found' });

      const query = { instituteId };
      // If student has a specific batchId, filter to that batch
      if (student.batchId) {
        query.$or = [
          { batchId: student.batchId },
          { _id: ObjectId.isValid(student.batchId) ? new ObjectId(student.batchId) : null }
        ];
      }
      const docs = await batches.find(query).sort({ createdAt: -1 }).toArray();
      res.status(200).json({
        batches: docs.map(d => ({ ...d, id: d._id.toString() }))
      });
    } catch (err) {
      console.error('Student batches error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch batches' });
    }
  });

  // ─── STUDENT MATERIALS ─────────────────────────────────────────────────────
  router.get('/materials', authenticate, requireStudent, async (req, res) => {
    try {
      const instituteId = new ObjectId(req.user.instituteId);
      const { subject, batch, type } = req.query;
      const query = { instituteId };
      if (subject) query.subject = subject;
      if (batch) query.batch = batch;
      if (type) query.type = type;
      const docs = await materials.find(query).sort({ createdAt: -1 }).toArray();
      res.status(200).json({
        materials: docs.map(d => ({
          ...d,
          id: d._id.toString(),
          isNew: (Date.now() - new Date(d.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000,
        }))
      });
    } catch (err) {
      console.error('Student materials error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch materials' });
    }
  });

  // ─── STUDENT PAYMENTS ──────────────────────────────────────────────────────
  router.get('/payments', authenticate, requireStudent, async (req, res) => {
    try {
      const instituteId = new ObjectId(req.user.instituteId);
      const studentId = new ObjectId(req.user.studentId);
      const student = await students.findOne({ _id: studentId, instituteId });
      if (!student) return res.status(404).json({ error: 'Student not found' });

      // Find payments matching student name
      const query = { instituteId, studentName: student.name };
      const docs = await payments.find(query).sort({ date: -1 }).toArray();

      const totalPaid = docs.filter(d => d.status === 'Completed').reduce((s, d) => s + (d.amount || 0), 0);
      const totalPending = docs.filter(d => d.status === 'Pending').reduce((s, d) => s + (d.amount || 0), 0);

      res.status(200).json({
        payments: docs.map(d => ({ ...d, id: d._id.toString() })),
        summary: {
          totalPaid,
          totalPending,
          totalRecords: docs.length,
        }
      });
    } catch (err) {
      console.error('Student payments error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch payments' });
    }
  });

  // ─── STUDENT ATTENDANCE SUMMARY ────────────────────────────────────────────
  router.get('/attendance/summary', authenticate, requireStudent, async (req, res) => {
    try {
      const instituteId = new ObjectId(req.user.instituteId);
      const internalStudentId = req.user.studentId;
      const student = await students.findOne({ _id: new ObjectId(internalStudentId), instituteId });
      if (!student) return res.status(404).json({ error: 'Student not found' });

      const keys = [internalStudentId];
      if (student.studentId) keys.push(student.studentId);

      const docs = await attendanceLogs.find({
        instituteId,
        studentId: { $in: keys }
      }).toArray();

      const total = docs.length;
      const present = docs.filter(d => d.status === 'present').length;
      const absent = docs.filter(d => d.status === 'absent').length;
      const late = docs.filter(d => d.status === 'late').length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      res.status(200).json({
        total, present, absent, late, percentage
      });
    } catch (err) {
      console.error('Student attendance summary error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch summary' });
    }
  });

  // ─── STUDENT DASHBOARD ─────────────────────────────────────────────────────
  router.get('/dashboard', authenticate, requireStudent, async (req, res) => {
    try {
      const instituteId = new ObjectId(req.user.instituteId);
      const studentId = new ObjectId(req.user.studentId);
      const student = await students.findOne({ _id: studentId, instituteId });
      if (!student) return res.status(404).json({ error: 'Student not found' });

      const keys = [req.user.studentId];
      if (student.studentId) keys.push(student.studentId);

      // Attendance
      const attDocs = await attendanceLogs.find({ instituteId, studentId: { $in: keys } }).toArray();
      const attTotal = attDocs.length;
      const attPresent = attDocs.filter(d => d.status === 'present').length;
      const attPercentage = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 0;

      // Payments
      const payDocs = await payments.find({ instituteId, studentName: student.name }).toArray();
      const pendingFees = payDocs.filter(d => d.status === 'Pending').reduce((s, d) => s + (d.amount || 0), 0);

      // Exams
      const examAttempts = db.collection('student_exam_attempts');
      const myAttempts = await examAttempts.find({ studentId, instituteId }).toArray();
      const avgScore = myAttempts.length > 0
        ? Math.round(myAttempts.reduce((s, a) => s + (a.score || 0), 0) / myAttempts.length)
        : 0;

      // Materials
      const materialCount = await materials.countDocuments({ instituteId });
      const recentMaterials = await materials.find({ instituteId }).sort({ createdAt: -1 }).limit(5).toArray();
      const newMaterialsThisWeek = await materials.countDocuments({
        instituteId,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });

      // Upcoming exams
      const examsCol = db.collection('exams');
      const upcomingExams = await examsCol.find({
        instituteId,
        $or: [
          { status: { $in: ['scheduled', 'live'] } },
          { published: true }
        ]
      }).sort({ scheduledDate: 1 }).limit(5).toArray();

      res.status(200).json({
        stats: {
          attendancePercentage: attPercentage,
          classesAttended: attPresent,
          totalClasses: attTotal,
          pendingFees,
          examsAttempted: myAttempts.length,
          upcomingExamsCount: upcomingExams.filter(e => e.status === 'scheduled' || e.status === 'live').length,
          averageScore: avgScore,
          materialsAvailable: materialCount,
          newMaterialsThisWeek,
        },
        upcomingExams: upcomingExams.map(e => ({ ...e, id: e._id.toString() })),
        recentMaterials: recentMaterials.map(m => ({ ...m, id: m._id.toString() })),
        attendanceByDate: attDocs.map(d => ({ date: d.date, status: d.status })),
      });
    } catch (err) {
      console.error('Student dashboard error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch dashboard' });
    }
  });

  // ─── STUDENT FEEDBACK ──────────────────────────────────────────────────────
  router.get('/feedback', authenticate, requireStudent, async (req, res) => {
    try {
      const instituteId = new ObjectId(req.user.instituteId);
      const studentId = new ObjectId(req.user.studentId);
      const docs = await feedback.find({ studentId, instituteId }).sort({ createdAt: -1 }).toArray();
      res.status(200).json({
        feedback: docs.map(d => ({ ...d, id: d._id.toString() }))
      });
    } catch (err) {
      console.error('Student feedback list error:', err);
      res.status(500).json({ error: err.message || 'Failed' });
    }
  });

  router.post('/feedback', authenticate, requireStudent, async (req, res) => {
    try {
      const { type, subject, message, rating } = req.body;
      if (!subject || !message) return res.status(400).json({ error: 'Subject and message required' });
      const doc = {
        studentId: new ObjectId(req.user.studentId),
        instituteId: new ObjectId(req.user.instituteId),
        type: type || 'general',
        subject,
        message,
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        isRead: false,
        reply: null,
        repliedAt: null,
        createdAt: new Date(),
      };
      const result = await feedback.insertOne(doc);
      res.status(201).json({ message: 'Feedback submitted', id: result.insertedId.toString() });
    } catch (err) {
      console.error('Student feedback create error:', err);
      res.status(500).json({ error: err.message || 'Failed' });
    }
  });

  router.delete('/feedback/:id', authenticate, requireStudent, async (req, res) => {
    try {
      const studentId = new ObjectId(req.user.studentId);
      const id = new ObjectId(req.params.id);
      const result = await feedback.deleteOne({ _id: id, studentId, reply: null });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found or already replied' });
      res.status(200).json({ message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message || 'Failed' });
    }
  });

  // ─── STUDENT SUPPORT TICKETS ───────────────────────────────────────────────
  router.get('/support/tickets', authenticate, requireStudent, async (req, res) => {
    try {
      const studentId = new ObjectId(req.user.studentId);
      const instituteId = new ObjectId(req.user.instituteId);
      const docs = await supportTickets.find({ studentId, instituteId }).sort({ createdAt: -1 }).toArray();
      res.status(200).json({
        tickets: docs.map(d => ({ ...d, id: d._id.toString() }))
      });
    } catch (err) {
      res.status(500).json({ error: err.message || 'Failed' });
    }
  });

  router.post('/support/tickets', authenticate, requireStudent, async (req, res) => {
    try {
      const { subject, description, category, priority } = req.body;
      if (!subject || !description) return res.status(400).json({ error: 'Subject and description required' });
      const count = await supportTickets.countDocuments({});
      const ticketId = `TKT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(count + 1).padStart(3, '0')}`;
      const doc = {
        studentId: new ObjectId(req.user.studentId),
        instituteId: new ObjectId(req.user.instituteId),
        ticketId,
        subject,
        description,
        category: category || 'other',
        priority: priority || 'medium',
        status: 'open',
        messages: [{ sender: 'student', message: description, sentAt: new Date() }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await supportTickets.insertOne(doc);
      res.status(201).json({ message: 'Ticket created', ticketId, id: result.insertedId.toString() });
    } catch (err) {
      res.status(500).json({ error: err.message || 'Failed' });
    }
  });

  router.post('/support/tickets/:id/message', authenticate, requireStudent, async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) return res.status(400).json({ error: 'Message required' });
      const id = new ObjectId(req.params.id);
      const studentId = new ObjectId(req.user.studentId);
      const result = await supportTickets.updateOne(
        { _id: id, studentId },
        {
          $push: { messages: { sender: 'student', message, sentAt: new Date() } },
          $set: { updatedAt: new Date() }
        }
      );
      if (result.matchedCount === 0) return res.status(404).json({ error: 'Ticket not found' });
      res.status(200).json({ message: 'Message sent' });
    } catch (err) {
      res.status(500).json({ error: err.message || 'Failed' });
    }
  });

  return router;
};
