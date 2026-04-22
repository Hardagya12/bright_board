const express = require('express');
const Joi = require('joi');
const { authenticate, requireInstitute, requireStudent } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();
  const exams = db.collection('exams');
  const questions = db.collection('questions');
  const attempts = db.collection('student_exam_attempts');
  const { ObjectId } = require('mongodb');

  // ─── Schemas ───────────────────────────────────────────────────────────────

  const examSchema = Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().allow('').max(2000).optional().default(''),
    durationMinutes: Joi.number().integer().min(1).max(600).required(),
    subject: Joi.string().allow('').max(200).optional(),
    scheduledDate: Joi.date().optional().allow(null),
    batchId: Joi.string().optional().allow(null, ''),
    // Legacy field – still accepted but status field takes precedence
    published: Joi.boolean().optional().default(false),
    // New fields
    status: Joi.string().valid('draft', 'scheduled', 'live', 'ended').optional().default('draft'),
    totalMarks: Joi.number().integer().min(0).optional().default(0),
    passingMarks: Joi.number().integer().min(0).optional().default(0),
    shuffleQuestions: Joi.boolean().optional().default(false),
    showResultImmediately: Joi.boolean().optional().default(true),
    instructions: Joi.string().allow('').max(5000).optional().default(''),
    negativeMarkingEnabled: Joi.boolean().optional().default(false),
    defaultNegativeMarks: Joi.number().min(0).optional().default(0),
  });

  const questionSchema = Joi.object({
    text: Joi.string().min(1).max(2000).required(),
    type: Joi.string().valid('mcq', 'true-false', 'short').optional().default('mcq'),
    // MCQ: array of option strings; True-False: auto ["True","False"]; Short: empty/ignored
    options: Joi.array().items(Joi.string().min(1).max(500)).optional().default([]),
    // MCQ: index of correct option; True-False: 0=True, 1=False
    correctIndex: Joi.number().integer().min(0).optional().allow(null),
    // Short answer: correct text
    correctAnswer: Joi.string().allow('').max(500).optional().default(''),
    // Marks
    marks: Joi.number().min(0).optional().default(1),
    negativeMarks: Joi.number().min(0).optional().default(0),
    // Optional image URL
    questionImage: Joi.string().allow('', null).uri().optional().default(null),
    // Ordering
    order: Joi.number().integer().optional(),
  });

  const submitSchema = Joi.object({
    answers: Joi.array().items(Joi.object({
      questionId: Joi.string().required(),
      chosenIndex: Joi.number().integer().min(-1).optional().allow(null), // -1 or null = unanswered
      textAnswer: Joi.string().allow('').max(1000).optional().default(''),
    })).required(),
    tabSwitchCount: Joi.number().integer().min(0).optional().default(0),
    submissionType: Joi.string().valid('manual', 'auto', 'timeout', 'violation').optional().default('manual'),
    timeTaken: Joi.number().integer().min(0).optional().default(0), // in seconds
  });

  const statusSchema = Joi.object({
    status: Joi.string().valid('draft', 'scheduled', 'live', 'ended').required(),
  });

  // ─── Helper: determine if exam is accessible to students ──────────────────
  const isStudentAccessible = (exam) => {
    // Support both legacy `published` and new `status` fields
    if (exam.status) return ['scheduled', 'live'].includes(exam.status);
    return exam.published === true;
  };

  const isLiveForAttempt = (exam) => {
    if (exam.status) return exam.status === 'live';
    return exam.published === true;
  };

  // ─── TUTOR ENDPOINTS ──────────────────────────────────────────────────────

  // Create exam
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
        published: value.status !== 'draft', // backward compat
        status: value.status,
        totalMarks: value.totalMarks,
        passingMarks: value.passingMarks,
        shuffleQuestions: value.shuffleQuestions,
        showResultImmediately: value.showResultImmediately,
        instructions: value.instructions,
        negativeMarkingEnabled: value.negativeMarkingEnabled,
        defaultNegativeMarks: value.defaultNegativeMarks,
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

  // List exams
  router.get('/tutor/exams', authenticate, requireInstitute, async (req, res) => {
    try {
      const instituteId = new ObjectId(req.user.instituteId);
      const { status } = req.query;
      const query = { instituteId };
      if (status) query.status = status;
      const docs = await exams.find(query).sort({ createdAt: -1 }).toArray();
      // Enrich with question count
      const examIds = docs.map(d => d._id);
      const qCounts = await questions.aggregate([
        { $match: { examId: { $in: examIds } } },
        { $group: { _id: '$examId', count: { $sum: 1 }, totalMarks: { $sum: '$marks' } } }
      ]).toArray();
      const qMap = new Map(qCounts.map(q => [q._id.toString(), q]));
      res.status(200).json({
        exams: docs.map(d => {
          const qInfo = qMap.get(d._id.toString()) || { count: 0, totalMarks: 0 };
          return {
            ...d,
            id: d._id.toString(),
            questionCount: qInfo.count,
            calculatedTotalMarks: qInfo.totalMarks,
          };
        })
      });
    } catch (err) {
      console.error('List exams error:', err);
      res.status(500).json({ error: err.message || 'Failed to list exams' });
    }
  });

  // Get single exam (with questions)
  router.get('/tutor/exams/:id', authenticate, requireInstitute, async (req, res) => {
    try {
      const instituteId = new ObjectId(req.user.instituteId);
      const examId = new ObjectId(req.params.id);
      const exam = await exams.findOne({ _id: examId, instituteId });
      if (!exam) return res.status(404).json({ error: 'Exam not found' });
      const qs = await questions.find({ examId }).sort({ order: 1, _id: 1 }).toArray();
      res.status(200).json({
        exam: { ...exam, id: exam._id.toString() },
        questions: qs.map(q => ({ ...q, id: q._id.toString() }))
      });
    } catch (err) {
      console.error('Get exam error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch exam' });
    }
  });

  // Update exam
  router.put('/tutor/exams/:id', authenticate, requireInstitute, async (req, res) => {
    try {
      const { error, value } = examSchema.min(1).validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });
      const instituteId = new ObjectId(req.user.instituteId);
      const examId = new ObjectId(req.params.id);
      const update = { ...value, updatedAt: new Date() };
      if (update.scheduledDate) update.scheduledDate = new Date(update.scheduledDate);
      if (update.status) update.published = update.status !== 'draft';
      const result = await exams.updateOne({ _id: examId, instituteId }, { $set: update });
      if (result.matchedCount === 0) return res.status(404).json({ error: 'Exam not found' });
      res.status(200).json({ message: 'Exam updated' });
    } catch (err) {
      console.error('Update exam error:', err);
      res.status(500).json({ error: err.message || 'Failed to update exam' });
    }
  });

  // Update exam status (dedicated endpoint for state transitions)
  router.put('/tutor/exams/:id/status', authenticate, requireInstitute, async (req, res) => {
    try {
      const { error, value } = statusSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });
      const instituteId = new ObjectId(req.user.instituteId);
      const examId = new ObjectId(req.params.id);
      const exam = await exams.findOne({ _id: examId, instituteId });
      if (!exam) return res.status(404).json({ error: 'Exam not found' });

      // Validate state transitions
      const validTransitions = {
        'draft': ['scheduled', 'live'],
        'scheduled': ['live', 'draft'],
        'live': ['ended'],
        'ended': ['draft'],
      };
      const currentStatus = exam.status || 'draft';
      const allowed = validTransitions[currentStatus] || [];
      if (!allowed.includes(value.status)) {
        return res.status(400).json({
          error: `Cannot transition from "${currentStatus}" to "${value.status}". Allowed: ${allowed.join(', ')}`
        });
      }

      await exams.updateOne(
        { _id: examId, instituteId },
        { $set: { status: value.status, published: value.status !== 'draft', updatedAt: new Date() } }
      );
      res.status(200).json({ message: `Exam status changed to "${value.status}"` });
    } catch (err) {
      console.error('Update exam status error:', err);
      res.status(500).json({ error: err.message || 'Failed to update status' });
    }
  });

  // Delete exam
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

  // ─── QUESTION ENDPOINTS ───────────────────────────────────────────────────

  // Add question
  router.post('/tutor/exams/:id/questions', authenticate, requireInstitute, async (req, res) => {
    try {
      const { error, value } = questionSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });
      const instituteId = new ObjectId(req.user.instituteId);
      const examId = new ObjectId(req.params.id);
      const exists = await exams.findOne({ _id: examId, instituteId });
      if (!exists) return res.status(404).json({ error: 'Exam not found' });

      // Type-specific validation
      if (value.type === 'mcq') {
        if (!value.options || value.options.length < 2) return res.status(400).json({ error: 'MCQ requires at least 2 options' });
        if (value.correctIndex == null || value.correctIndex < 0 || value.correctIndex >= value.options.length)
          return res.status(400).json({ error: 'correctIndex out of range for MCQ' });
      } else if (value.type === 'true-false') {
        value.options = ['True', 'False'];
        if (value.correctIndex == null) value.correctIndex = 0;
        if (value.correctIndex < 0 || value.correctIndex > 1)
          return res.status(400).json({ error: 'correctIndex must be 0 (True) or 1 (False)' });
      } else if (value.type === 'short') {
        if (!value.correctAnswer || value.correctAnswer.trim() === '')
          return res.status(400).json({ error: 'Short answer requires correctAnswer' });
        value.options = [];
        value.correctIndex = null;
      }

      // Auto-assign order
      const existingCount = await questions.countDocuments({ examId });
      const q = {
        examId,
        type: value.type,
        text: value.text,
        options: value.options,
        correctIndex: value.correctIndex,
        correctAnswer: value.correctAnswer || '',
        marks: value.marks,
        negativeMarks: value.negativeMarks,
        questionImage: value.questionImage,
        order: value.order != null ? value.order : existingCount,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await questions.insertOne(q);
      res.status(201).json({
        message: 'Question added',
        questionId: result.insertedId.toString(),
        question: { id: result.insertedId.toString(), ...q }
      });
    } catch (err) {
      console.error('Add question error:', err);
      res.status(500).json({ error: err.message || 'Failed to add question' });
    }
  });

  // Update question
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
      if (update.type === 'true-false') update.options = ['True', 'False'];
      const result = await questions.updateOne({ _id: qid, examId }, { $set: update });
      if (result.matchedCount === 0) return res.status(404).json({ error: 'Question not found' });
      res.status(200).json({ message: 'Question updated' });
    } catch (err) {
      console.error('Update question error:', err);
      res.status(500).json({ error: err.message || 'Failed to update question' });
    }
  });

  // Reorder questions
  router.put('/tutor/exams/:id/questions-order', authenticate, requireInstitute, async (req, res) => {
    try {
      const { order } = req.body; // array of { questionId, order }
      if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be an array' });
      const examId = new ObjectId(req.params.id);
      const ops = order.map(o => ({
        updateOne: {
          filter: { _id: new ObjectId(o.questionId), examId },
          update: { $set: { order: o.order, updatedAt: new Date() } },
        }
      }));
      if (ops.length > 0) await questions.bulkWrite(ops);
      res.status(200).json({ message: 'Questions reordered' });
    } catch (err) {
      console.error('Reorder questions error:', err);
      res.status(500).json({ error: err.message || 'Failed to reorder' });
    }
  });

  // Delete question
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

  // ─── STUDENT ENDPOINTS ────────────────────────────────────────────────────

  // List exams (accessible to students: status=scheduled|live OR published=true)
  router.get('/student/exams', authenticate, requireStudent, async (req, res) => {
    try {
      const instituteId = new ObjectId(req.user.instituteId);
      const studentId = new ObjectId(req.user.studentId);
      const { batchId } = req.query;
      // Support both legacy (published) and new (status) filtering
      const query = {
        instituteId,
        $or: [
          { status: { $in: ['scheduled', 'live', 'ended'] } },
          { published: true },
        ]
      };
      if (batchId) query.batchId = batchId;
      const docs = await exams.find(query).sort({ createdAt: -1 }).toArray();

      // Check which exams the student has already attempted
      const examIds = docs.map(d => d._id);
      const studentAttempts = await attempts.find({
        examId: { $in: examIds }, studentId
      }).project({ examId: 1, score: 1, correct: 1, totalQuestions: 1 }).toArray();
      const attemptMap = new Map(studentAttempts.map(a => [a.examId.toString(), a]));

      res.status(200).json({
        exams: docs.map(d => {
          const att = attemptMap.get(d._id.toString());
          return {
            ...d,
            id: d._id.toString(),
            attempted: !!att,
            attemptScore: att ? att.score : null,
            attemptCorrect: att ? att.correct : null,
          };
        })
      });
    } catch (err) {
      console.error('Student list exams error:', err);
      res.status(500).json({ error: err.message || 'Failed to list exams' });
    }
  });

  // Get exam details (pre-start: shows instructions but NOT questions)
  router.get('/student/exams/:id', authenticate, requireStudent, async (req, res) => {
    try {
      const instituteId = new ObjectId(req.user.instituteId);
      const examId = new ObjectId(req.params.id);
      const exam = await exams.findOne({ _id: examId, instituteId });
      if (!exam) return res.status(404).json({ error: 'Exam not found' });
      if (!isStudentAccessible(exam)) return res.status(403).json({ error: 'Exam not available' });

      const questionCount = await questions.countDocuments({ examId });
      const totalMarksCalc = (await questions.aggregate([
        { $match: { examId } },
        { $group: { _id: null, total: { $sum: '$marks' } } }
      ]).toArray())[0]?.total || exam.totalMarks || 0;

      // Check if already attempted
      const studentId = new ObjectId(req.user.studentId);
      const existing = await attempts.findOne({ examId, studentId });

      res.status(200).json({
        exam: {
          ...exam,
          id: exam._id.toString(),
          questionCount,
          calculatedTotalMarks: totalMarksCalc,
          attempted: !!existing,
          attemptScore: existing ? existing.score : null,
        }
      });
    } catch (err) {
      console.error('Student get exam error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch exam' });
    }
  });

  // Start exam (returns questions without correct answers)
  router.post('/student/exams/:id/start', authenticate, requireStudent, async (req, res) => {
    try {
      const instituteId = new ObjectId(req.user.instituteId);
      const studentId = new ObjectId(req.user.studentId);
      const examId = new ObjectId(req.params.id);
      const exam = await exams.findOne({ _id: examId, instituteId });
      if (!exam) return res.status(404).json({ error: 'Exam not found' });
      if (!isLiveForAttempt(exam)) return res.status(403).json({ error: 'Exam is not live. Cannot start.' });

      const existing = await attempts.findOne({ examId, studentId });
      if (existing) return res.status(409).json({ error: 'Already attempted this exam' });

      let qs = await questions.find({ examId }).sort({ order: 1, _id: 1 }).toArray();

      // Shuffle if enabled
      if (exam.shuffleQuestions) {
        for (let i = qs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [qs[i], qs[j]] = [qs[j], qs[i]];
        }
      }

      // Strip correct answers before sending
      const safeQuestions = qs.map(q => ({
        id: q._id.toString(),
        type: q.type || 'mcq',
        text: q.text,
        options: q.options || [],
        marks: q.marks || 1,
        negativeMarks: q.negativeMarks || 0,
        questionImage: q.questionImage || null,
      }));

      res.status(200).json({
        exam: {
          id: exam._id.toString(),
          title: exam.title,
          subject: exam.subject,
          durationMinutes: exam.durationMinutes,
          totalMarks: exam.totalMarks,
          passingMarks: exam.passingMarks,
          showResultImmediately: exam.showResultImmediately !== false,
          instructions: exam.instructions || '',
          negativeMarkingEnabled: exam.negativeMarkingEnabled || false,
        },
        questions: safeQuestions,
        startTime: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Start exam error:', err);
      res.status(500).json({ error: err.message || 'Failed to start exam' });
    }
  });

  // Submit exam (with enhanced scoring)
  router.post('/student/exams/:id/submit', authenticate, requireStudent, async (req, res) => {
    try {
      const { error, value } = submitSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });
      const instituteId = new ObjectId(req.user.instituteId);
      const studentId = new ObjectId(req.user.studentId);
      const examId = new ObjectId(req.params.id);
      const exam = await exams.findOne({ _id: examId, instituteId });
      if (!exam) return res.status(404).json({ error: 'Exam not found' });

      const existing = await attempts.findOne({ examId, studentId });
      if (existing) return res.status(409).json({ error: 'Already attempted' });

      const qs = await questions.find({ examId }).toArray();
      const qMap = new Map(qs.map(q => [q._id.toString(), q]));
      const totalQuestions = qs.length;
      const maxMarks = qs.reduce((sum, q) => sum + (q.marks || 1), 0);

      let totalScore = 0;
      let correctCount = 0;
      let wrongCount = 0;
      let unattemptedCount = 0;
      const gradedAnswers = [];

      for (const a of value.answers) {
        const q = qMap.get(a.questionId);
        if (!q) continue;
        const qMarks = q.marks || 1;
        const qNeg = q.negativeMarks || 0;
        let isCorrect = false;
        let marksAwarded = 0;

        if (a.chosenIndex == null && (!a.textAnswer || a.textAnswer.trim() === '')) {
          // Unanswered
          unattemptedCount++;
          gradedAnswers.push({ questionId: a.questionId, chosenIndex: null, textAnswer: '', isCorrect: false, marksAwarded: 0 });
          continue;
        }

        if ((q.type || 'mcq') === 'short') {
          // Case-insensitive comparison for short answer
          isCorrect = q.correctAnswer && a.textAnswer &&
            q.correctAnswer.trim().toLowerCase() === a.textAnswer.trim().toLowerCase();
        } else {
          // MCQ and True/False
          isCorrect = a.chosenIndex === q.correctIndex;
        }

        if (isCorrect) {
          marksAwarded = qMarks;
          correctCount++;
        } else {
          marksAwarded = -qNeg;
          wrongCount++;
        }
        totalScore += marksAwarded;

        gradedAnswers.push({
          questionId: a.questionId,
          chosenIndex: a.chosenIndex,
          textAnswer: a.textAnswer || '',
          isCorrect,
          marksAwarded,
        });
      }

      // Ensure score doesn't go negative
      totalScore = Math.max(0, totalScore);
      const percentage = maxMarks > 0 ? Math.round((totalScore / maxMarks) * 100) : 0;
      const passed = percentage >= (exam.passingMarks || 40);

      const attempt = {
        examId,
        studentId,
        instituteId,
        answers: gradedAnswers,
        totalQuestions,
        correct: correctCount,
        wrong: wrongCount,
        unattempted: unattemptedCount,
        totalScore,
        maxMarks,
        score: percentage, // backward compat: percentage score
        passed,
        tabSwitchCount: value.tabSwitchCount || 0,
        submissionType: value.submissionType || 'manual',
        timeTaken: value.timeTaken || 0,
        startedAt: new Date(),
        submittedAt: new Date(),
        createdAt: new Date(),
      };
      await attempts.insertOne(attempt);

      const responseData = {
        message: 'Submitted',
        score: percentage,
        totalScore,
        maxMarks,
        correct: correctCount,
        wrong: wrongCount,
        unattempted: unattemptedCount,
        total: totalQuestions,
        passed,
        submissionType: value.submissionType,
      };

      // If showResultImmediately is false, don't include detailed scoring
      if (exam.showResultImmediately === false) {
        res.status(201).json({ message: 'Submitted', showResult: false });
      } else {
        res.status(201).json({ ...responseData, showResult: true });
      }
    } catch (err) {
      console.error('Submit exam error:', err);
      res.status(500).json({ error: err.message || 'Failed to submit exam' });
    }
  });

  return router;
};