const express = require('express');
const { authenticate, requireInstitute, requireStudent } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();
  const attempts = db.collection('student_exam_attempts');
  const students = db.collection('students');
  const exams = db.collection('exams');
  const questions = db.collection('questions');
  const { ObjectId } = require('mongodb');

  // ─── Tutor: List results (enhanced with submission metadata) ───────────────
  router.get('/tutor/results', authenticate, requireInstitute, async (req, res) => {
    try {
      const instituteId = new ObjectId(req.user.instituteId);
      const { batchId, examId } = req.query;
      const pipeline = [
        { $match: { instituteId } },
        ...(examId ? [{ $match: { examId: new ObjectId(examId) } }] : []),
        { $lookup: { from: 'students', localField: 'studentId', foreignField: '_id', as: 'student' } },
        { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
        ...(batchId ? [{ $match: { 'student.batchId': batchId } }] : []),
        { $lookup: { from: 'exams', localField: 'examId', foreignField: '_id', as: 'exam' } },
        { $unwind: { path: '$exam', preserveNullAndEmptyArrays: true } },
        { $project: {
          _id: 1,
          studentId: { $toString: '$student._id' },
          studentName: '$student.name',
          batch: '$student.batchId',
          examId: { $toString: '$exam._id' },
          examName: '$exam.title',
          subjectName: '$exam.subject',
          totalMarks: '$totalQuestions',
          marksObtained: '$correct',
          totalScore: { $ifNull: ['$totalScore', '$correct'] },
          maxMarks: { $ifNull: ['$maxMarks', '$totalQuestions'] },
          percentage: '$score',
          status: { $cond: [{ $gte: ['$score', 40] }, 'Pass', 'Fail'] },
          grade: {
            $switch: {
              branches: [
                { case: { $gte: ['$score', 90] }, then: 'A+' },
                { case: { $gte: ['$score', 80] }, then: 'A' },
                { case: { $gte: ['$score', 70] }, then: 'B' },
                { case: { $gte: ['$score', 60] }, then: 'C' },
                { case: { $gte: ['$score', 50] }, then: 'D' },
                { case: { $gte: ['$score', 40] }, then: 'E' },
              ],
              default: 'F'
            }
          },
          remarks: '',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } },
          // New fields
          submissionType: { $ifNull: ['$submissionType', 'manual'] },
          tabSwitchCount: { $ifNull: ['$tabSwitchCount', 0] },
          timeTaken: { $ifNull: ['$timeTaken', 0] },
          wrong: { $ifNull: ['$wrong', 0] },
          unattempted: { $ifNull: ['$unattempted', 0] },
          passed: { $ifNull: ['$passed', { $gte: ['$score', 40] }] },
        } }
      ];
      const docs = await attempts.aggregate(pipeline).toArray();
      res.status(200).json({ results: docs.map(d => ({ id: d._id.toString(), ...d })) });
    } catch (err) {
      console.error('Tutor results error:', err);
      res.status(500).json({ error: err.message || 'Failed to list results' });
    }
  });

  // ─── Tutor: Per-question answer review for a specific attempt ──────────────
  router.get('/tutor/results/:attemptId/answers', authenticate, requireInstitute, async (req, res) => {
    try {
      const instituteId = new ObjectId(req.user.instituteId);
      const attemptId = new ObjectId(req.params.attemptId);
      const attempt = await attempts.findOne({ _id: attemptId, instituteId });
      if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

      const examId = attempt.examId;
      const qs = await questions.find({ examId }).sort({ order: 1, _id: 1 }).toArray();
      const ansMap = new Map((attempt.answers || []).map(a => [a.questionId, a]));

      const reviewData = qs.map((q, idx) => {
        const ans = ansMap.get(q._id.toString()) || {};
        return {
          questionNumber: idx + 1,
          questionId: q._id.toString(),
          type: q.type || 'mcq',
          text: q.text,
          options: q.options || [],
          correctIndex: q.correctIndex,
          correctAnswer: q.correctAnswer || '',
          marks: q.marks || 1,
          negativeMarks: q.negativeMarks || 0,
          studentAnswer: {
            chosenIndex: ans.chosenIndex ?? null,
            textAnswer: ans.textAnswer || '',
          },
          isCorrect: ans.isCorrect || false,
          marksAwarded: ans.marksAwarded || 0,
        };
      });

      res.status(200).json({ answers: reviewData });
    } catch (err) {
      console.error('Answer review error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch answers' });
    }
  });

  // ─── Tutor: Leaderboard for an exam ────────────────────────────────────────
  router.get('/tutor/results/leaderboard/:examId', authenticate, requireInstitute, async (req, res) => {
    try {
      const instituteId = new ObjectId(req.user.instituteId);
      const examId = new ObjectId(req.params.examId);
      const pipeline = [
        { $match: { instituteId, examId } },
        { $lookup: { from: 'students', localField: 'studentId', foreignField: '_id', as: 'student' } },
        { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
        { $sort: { score: -1, timeTaken: 1 } },
        { $project: {
          studentName: '$student.name',
          studentId: { $toString: '$student._id' },
          batch: '$student.batchId',
          score: 1,
          totalScore: { $ifNull: ['$totalScore', '$correct'] },
          maxMarks: { $ifNull: ['$maxMarks', '$totalQuestions'] },
          correct: 1,
          wrong: { $ifNull: ['$wrong', 0] },
          timeTaken: { $ifNull: ['$timeTaken', 0] },
          submissionType: { $ifNull: ['$submissionType', 'manual'] },
        } }
      ];
      const docs = await attempts.aggregate(pipeline).toArray();
      const leaderboard = docs.map((d, i) => ({
        rank: i + 1,
        medal: i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null,
        ...d,
        id: d._id.toString(),
      }));
      res.status(200).json({ leaderboard });
    } catch (err) {
      console.error('Leaderboard error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch leaderboard' });
    }
  });

  // ─── Tutor: Results analytics ──────────────────────────────────────────────
  router.get('/tutor/results/analytics', authenticate, requireInstitute, async (req, res) => {
    try {
      const instituteId = new ObjectId(req.user.instituteId);
      const perf = await attempts.aggregate([
        { $match: { instituteId } },
        { $lookup: { from: 'exams', localField: 'examId', foreignField: '_id', as: 'exam' } },
        { $unwind: { path: '$exam', preserveNullAndEmptyArrays: true } },
        { $group: { _id: '$exam.subject', average: { $avg: '$score' } } },
        { $sort: { average: -1 } }
      ]).toArray();
      const trend = await attempts.aggregate([
        { $match: { instituteId } },
        { $group: { _id: { $substr: [{ $dateToString: { format: '%Y-%m', date: '$submittedAt' } }, 0, 7] }, average: { $avg: '$score' } } },
        { $sort: { _id: 1 } }
      ]).toArray();
      const dist = await attempts.aggregate([
        { $match: { instituteId } },
        { $bucket: {
          groupBy: '$score',
          boundaries: [0, 40, 50, 60, 70, 80, 90, 101],
          default: 'Other',
          output: { count: { $sum: 1 } }
        } }
      ]).toArray();
      const gradeMap = ['F','E','D','C','B','A','A+'];
      const distribution = dist.filter(d => d._id !== 'Other').map((d, i) => ({ name: gradeMap[i], value: d.count }));
      res.status(200).json({
        performance: perf.map(p => ({ name: p._id || 'Unknown', average: Math.round(p.average) })),
        trend: trend.map(t => ({ month: t._id, average: Math.round(t.average) })),
        distribution,
      });
    } catch (err) {
      console.error('Results analytics error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch analytics' });
    }
  });

  // ─── Student: Results Analytics ───────────────────────────────────────────
  router.get('/student/results/analytics', authenticate, requireStudent, async (req, res) => {
    try {
      const studentId = new ObjectId(req.user.studentId);
      const instituteId = new ObjectId(req.user.instituteId);
      const trend = await attempts.aggregate([
        { $match: { instituteId, studentId } },
        { $group: { _id: { $substr: [{ $dateToString: { format: '%Y-%m', date: '$submittedAt' } }, 0, 7] }, average: { $avg: '$score' } } },
        { $sort: { _id: 1 } }
      ]).toArray();
      const dist = await attempts.aggregate([
        { $match: { instituteId, studentId } },
        { $bucket: {
          groupBy: '$score',
          boundaries: [0, 40, 50, 60, 70, 80, 90, 101],
          default: 'Other',
          output: { count: { $sum: 1 } }
        } }
      ]).toArray();
      const gradeMap = ['F','E','D','C','B','A','A+'];
      const distribution = dist.filter(d => d._id !== 'Other').map((d, i) => ({ name: gradeMap[i], value: d.count }));
      res.status(200).json({
        trend: trend.map(t => ({ month: t._id, average: Math.round(t.average) })),
        distribution,
      });
    } catch (err) {
      console.error('Student results analytics error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch analytics' });
    }
  });

  // ─── Student: List results ─────────────────────────────────────────────────
  router.get('/student/results', authenticate, requireStudent, async (req, res) => {
    try {
      const studentId = new ObjectId(req.user.studentId);
      const instituteId = new ObjectId(req.user.instituteId);
      const pipeline = [
        { $match: { instituteId, studentId } },
        { $lookup: { from: 'exams', localField: 'examId', foreignField: '_id', as: 'exam' } },
        { $unwind: { path: '$exam', preserveNullAndEmptyArrays: true } },
        { $project: {
          _id: 1,
          studentId: { $toString: '$studentId' },
          examId: { $toString: '$exam._id' },
          examName: '$exam.title',
          subjectName: '$exam.subject',
          totalMarks: '$totalQuestions',
          marksObtained: '$correct',
          totalScore: { $ifNull: ['$totalScore', '$correct'] },
          maxMarks: { $ifNull: ['$maxMarks', '$totalQuestions'] },
          percentage: '$score',
          status: { $cond: [{ $gte: ['$score', 40] }, 'Pass', 'Fail'] },
          grade: {
            $switch: {
              branches: [
                { case: { $gte: ['$score', 90] }, then: 'A+' },
                { case: { $gte: ['$score', 80] }, then: 'A' },
                { case: { $gte: ['$score', 70] }, then: 'B' },
                { case: { $gte: ['$score', 60] }, then: 'C' },
                { case: { $gte: ['$score', 50] }, then: 'D' },
                { case: { $gte: ['$score', 40] }, then: 'E' },
              ],
              default: 'F'
            }
          },
          remarks: '',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } },
          submissionType: { $ifNull: ['$submissionType', 'manual'] },
          tabSwitchCount: { $ifNull: ['$tabSwitchCount', 0] },
          timeTaken: { $ifNull: ['$timeTaken', 0] },
          wrong: { $ifNull: ['$wrong', 0] },
          unattempted: { $ifNull: ['$unattempted', 0] },
        } }
      ];
      const docs = await attempts.aggregate(pipeline).toArray();
      res.status(200).json({ results: docs.map(d => ({ id: d._id.toString(), ...d })) });
    } catch (err) {
      console.error('Student results error:', err);
      res.status(500).json({ error: err.message || 'Failed to list results' });
    }
  });

  // ─── Student: Per-question answer review ───────────────────────────────────
  router.get('/student/results/:attemptId/answers', authenticate, requireStudent, async (req, res) => {
    try {
      const studentId = new ObjectId(req.user.studentId);
      const attemptId = new ObjectId(req.params.attemptId);
      const attempt = await attempts.findOne({ _id: attemptId, studentId });
      if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

      const exam = await exams.findOne({ _id: attempt.examId });
      // Only show answers if the exam allows immediate results
      if (exam && exam.showResultImmediately === false) {
        return res.status(403).json({ error: 'Answer review not available yet' });
      }

      const qs = await questions.find({ examId: attempt.examId }).sort({ order: 1, _id: 1 }).toArray();
      const ansMap = new Map((attempt.answers || []).map(a => [a.questionId, a]));

      const reviewData = qs.map((q, idx) => {
        const ans = ansMap.get(q._id.toString()) || {};
        return {
          questionNumber: idx + 1,
          type: q.type || 'mcq',
          text: q.text,
          options: q.options || [],
          correctIndex: q.correctIndex,
          correctAnswer: q.correctAnswer || '',
          marks: q.marks || 1,
          studentAnswer: {
            chosenIndex: ans.chosenIndex ?? null,
            textAnswer: ans.textAnswer || '',
          },
          isCorrect: ans.isCorrect || false,
          marksAwarded: ans.marksAwarded || 0,
        };
      });

      res.status(200).json({ answers: reviewData });
    } catch (err) {
      console.error('Student answer review error:', err);
      res.status(500).json({ error: err.message || 'Failed' });
    }
  });

  // ─── Student: Analytics ────────────────────────────────────────────────────
  router.get('/student/results/analytics', authenticate, requireStudent, async (req, res) => {
    try {
      const studentId = new ObjectId(req.user.studentId);
      const instituteId = new ObjectId(req.user.instituteId);
      const trend = await attempts.aggregate([
        { $match: { instituteId, studentId } },
        { $group: { _id: { $substr: [{ $dateToString: { format: '%Y-%m', date: '$submittedAt' } }, 0, 7] }, average: { $avg: '$score' } } },
        { $sort: { _id: 1 } }
      ]).toArray();
      const dist = await attempts.aggregate([
        { $match: { instituteId, studentId } },
        { $bucket: {
          groupBy: '$score',
          boundaries: [0, 40, 50, 60, 70, 80, 90, 101],
          default: 'Other',
          output: { count: { $sum: 1 } }
        } }
      ]).toArray();
      const gradeMap = ['F','E','D','C','B','A','A+'];
      const distribution = dist.filter(d => d._id !== 'Other').map((d, i) => ({ name: gradeMap[i], value: d.count }));
      res.status(200).json({
        trend: trend.map(t => ({ month: t._id, average: Math.round(t.average) })),
        distribution,
      });
    } catch (err) {
      console.error('Student results analytics error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch analytics' });
    }
  });

  return router;
};