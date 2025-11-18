const express = require('express');
const Joi = require('joi');
const { authenticate, requireInstitute, requireStudent } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();
  const exams = db.collection('exams');
  const questions = db.collection('questions');
  const attempts = db.collection('student_exam_attempts');
  const { ObjectId } = require('mongodb');

  const examSchema = Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().allow('').max(2000).optional().default(''),
    durationMinutes: Joi.number().integer().min(1).max(600).required(),
    subject: Joi.string().allow('').max(200).optional(),
    scheduledDate: Joi.date().optional(),
    batchId: Joi.string().optional(),
    published: Joi.boolean().optional().default(false),
  });

  const questionSchema = Joi.object({
    text: Joi.string().min(1).max(1000).required(),
    options: Joi.array().items(Joi.string().min(1).max(500)).min(2).required(),
    correctIndex: Joi.number().integer().min(0).required(),
  });

  const submitSchema = Joi.object({
    answers: Joi.array().items(Joi.object({
      questionId: Joi.string().required(),
      chosenIndex: Joi.number().integer().min(0).required(),
    })).min(1).required(),
  });

  // Tutor: Create exam
  router.post('/tutor/exams', authenticate, requireInstitute, async (req, res) => {
    try {
      
      const { error, value } = examSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const doc = {
        instituteId: new ObjectId(req.user.instituteId),
        title: value.title,
        description: value.description,
        durationMinutes: value.durationMinutes,
        subject: value.subject || null,
        scheduledDate: value.scheduledDate ? new Date(value.scheduledDate) : null,
        batchId: value.batchId || null,
        published: !!value.published,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await exams.insertOne(doc);
      res.status(201).json({
        message: 'Exam created',
        examId: result.insertedId.toString(),
        exam: { id: result.insertedId.toString(), ...doc },
      });
    } catch (err) {
      console.error('Create exam error:', err);
      res.status(500).json({ error: err.message || 'Failed to create exam' });
    }
  });

  // Tutor: List exams
  router.get('/tutor/exams', authenticate, requireInstitute, async (req, res) => {
    try {
      
      const instituteId = new ObjectId(req.user.instituteId);
      const docs = await exams.find({ instituteId }).sort({ createdAt: -1 }).toArray();
      res.status(200).json({ exams: docs.map(d => ({ ...d, id: d._id.toString() })) });
    } catch (err) {
      console.error('List exams error:', err);
      res.status(500).json({ error: err.message || 'Failed to list exams' });
    }
  });

  // Tutor: Get single exam (with questions)
  router.get('/tutor/exams/:id', authenticate, requireInstitute, async (req, res) => {
    try {
      
      const instituteId = new ObjectId(req.user.instituteId);
      const examId = new ObjectId(req.params.id);
      const exam = await exams.findOne({ _id: examId, instituteId });
      if (!exam) return res.status(404).json({ error: 'Exam not found' });
      const qs = await questions.find({ examId }).sort({ _id: 1 }).toArray();
      res.status(200).json({ exam: { ...exam, id: exam._id.toString() }, questions: qs.map(q => ({ ...q, id: q._id.toString() })) });
    } catch (err) {
      console.error('Get exam error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch exam' });
    }
  });

  // Tutor: Update exam
  router.put('/tutor/exams/:id', authenticate, requireInstitute, async (req, res) => {
    try {
      
      const { error, value } = examSchema.min(1).validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });
      const instituteId = new ObjectId(req.user.instituteId);
      const examId = new ObjectId(req.params.id);
      const update = { ...value, updatedAt: new Date() };
      if (update.scheduledDate) update.scheduledDate = new Date(update.scheduledDate);
      const result = await exams.updateOne({ _id: examId, instituteId }, { $set: update });
      if (result.matchedCount === 0) return res.status(404).json({ error: 'Exam not found' });
      res.status(200).json({ message: 'Exam updated' });
    } catch (err) {
      console.error('Update exam error:', err);
      res.status(500).json({ error: err.message || 'Failed to update exam' });
    }
  });

  // Tutor: Delete exam
  router.delete('/tutor/exams/:id', authenticate, requireInstitute, async (req, res) => {
    try {
      
      const instituteId = new ObjectId(req.user.instituteId);
      const examId = new ObjectId(req.params.id);
      const delExam = await exams.deleteOne({ _id: examId, instituteId });
      if (delExam.deletedCount === 0) return res.status(404).json({ error: 'Exam not found' });
      await questions.deleteMany({ examId });
      await attempts.deleteMany({ examId });
      res.status(200).json({ message: 'Exam deleted' });
    } catch (err) {
      console.error('Delete exam error:', err);
      res.status(500).json({ error: err.message || 'Failed to delete exam' });
    }
  });

  // Tutor: Add question
  router.post('/tutor/exams/:id/questions', authenticate, requireInstitute, async (req, res) => {
    try {
      
      const { error, value } = questionSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });
      const instituteId = new ObjectId(req.user.instituteId);
      const examId = new ObjectId(req.params.id);
      const exists = await exams.findOne({ _id: examId, instituteId });
      if (!exists) return res.status(404).json({ error: 'Exam not found' });
      if (value.correctIndex < 0 || value.correctIndex >= value.options.length) return res.status(400).json({ error: 'correctIndex out of range' });
      const q = { examId, text: value.text, options: value.options, correctIndex: value.correctIndex, createdAt: new Date(), updatedAt: new Date() };
      const result = await questions.insertOne(q);
      res.status(201).json({ message: 'Question added', questionId: result.insertedId.toString(), question: { id: result.insertedId.toString(), ...q } });
    } catch (err) {
      console.error('Add question error:', err);
      res.status(500).json({ error: err.message || 'Failed to add question' });
    }
  });

  // Tutor: Update question
  router.put('/tutor/exams/:id/questions/:qid', authenticate, requireInstitute, async (req, res) => {
    try {
      
      const { error, value } = questionSchema.min(1).validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });
      const instituteId = new ObjectId(req.user.instituteId);
      const examId = new ObjectId(req.params.id);
      const qid = new ObjectId(req.params.qid);
      const exists = await exams.findOne({ _id: examId, instituteId });
      if (!exists) return res.status(404).json({ error: 'Exam not found' });
      const update = { ...value, updatedAt: new Date() };
      if (update.correctIndex != null && update.options) {
        if (update.correctIndex < 0 || update.correctIndex >= update.options.length) return res.status(400).json({ error: 'correctIndex out of range' });
      }
      const result = await questions.updateOne({ _id: qid, examId }, { $set: update });
      if (result.matchedCount === 0) return res.status(404).json({ error: 'Question not found' });
      res.status(200).json({ message: 'Question updated' });
    } catch (err) {
      console.error('Update question error:', err);
      res.status(500).json({ error: err.message || 'Failed to update question' });
    }
  });

  // Tutor: Delete question
  router.delete('/tutor/exams/:id/questions/:qid', authenticate, requireInstitute, async (req, res) => {
    try {
      
      const examId = new ObjectId(req.params.id);
      const qid = new ObjectId(req.params.qid);
      const del = await questions.deleteOne({ _id: qid, examId });
      if (del.deletedCount === 0) return res.status(404).json({ error: 'Question not found' });
      res.status(200).json({ message: 'Question deleted' });
    } catch (err) {
      console.error('Delete question error:', err);
      res.status(500).json({ error: err.message || 'Failed to delete question' });
    }
  });

  // Student: List exams (published, same institute, optional batch filter)
  router.get('/student/exams', authenticate, requireStudent, async (req, res) => {
    try {
      
      const instituteId = new ObjectId(req.user.instituteId);
      const { batchId } = req.query;
      const query = { instituteId, published: true };
      if (batchId) query.batchId = batchId;
      const docs = await exams.find(query).sort({ createdAt: -1 }).toArray();
      res.status(200).json({ exams: docs.map(d => ({ ...d, id: d._id.toString() })) });
    } catch (err) {
      console.error('Student list exams error:', err);
      res.status(500).json({ error: err.message || 'Failed to list exams' });
    }
  });

  // Student: Get exam questions
  router.get('/student/exams/:id', authenticate, requireStudent, async (req, res) => {
    try {
      
      const instituteId = new ObjectId(req.user.instituteId);
      const examId = new ObjectId(req.params.id);
      const exam = await exams.findOne({ _id: examId, instituteId, published: true });
      if (!exam) return res.status(404).json({ error: 'Exam not found' });
      const qs = await questions.find({ examId }).project({ correctIndex: 0 }).sort({ _id: 1 }).toArray();
      res.status(200).json({ exam: { ...exam, id: exam._id.toString() }, questions: qs.map(q => ({ ...q, id: q._id.toString() })) });
    } catch (err) {
      console.error('Student get exam error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch exam' });
    }
  });

  // Student: Submit exam
  router.post('/student/exams/:id/submit', authenticate, requireStudent, async (req, res) => {
    try {
      
      const { error, value } = submitSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });
      const instituteId = new ObjectId(req.user.instituteId);
      const studentId = new ObjectId(req.user.studentId);
      const examId = new ObjectId(req.params.id);
      const exam = await exams.findOne({ _id: examId, instituteId, published: true });
      if (!exam) return res.status(404).json({ error: 'Exam not found' });

      const existing = await attempts.findOne({ examId, studentId });
      if (existing) return res.status(409).json({ error: 'Already attempted' });

      const qs = await questions.find({ examId }).toArray();
      const map = new Map(qs.map(q => [q._id.toString(), q]));
      let total = qs.length;
      let correct = 0;
      for (const a of value.answers) {
        const q = map.get(a.questionId);
        if (!q) continue;
        if (a.chosenIndex === q.correctIndex) correct++;
      }
      const score = Math.round((correct / Math.max(total, 1)) * 100);

      const attempt = {
        examId,
        studentId,
        instituteId,
        answers: value.answers,
        totalQuestions: total,
        correct,
        score,
        startedAt: new Date(),
        submittedAt: new Date(),
        createdAt: new Date(),
      };
      await attempts.insertOne(attempt);

      res.status(201).json({ message: 'Submitted', score, correct, total });
    } catch (err) {
      console.error('Submit exam error:', err);
      res.status(500).json({ error: err.message || 'Failed to submit exam' });
    }
  });

  return router;
};