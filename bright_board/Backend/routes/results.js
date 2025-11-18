const express = require('express');
const { authenticate, requireInstitute, requireStudent } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();
  const attempts = db.collection('student_exam_attempts');
  const students = db.collection('students');
  const exams = db.collection('exams');
  const { ObjectId } = require('mongodb');

  router.get('/tutor/results', authenticate, requireInstitute, async (req, res) => {
    try {
      
      const instituteId = new ObjectId(req.user.instituteId);
      const { batchId } = req.query;
      const pipeline = [
        { $match: { instituteId } },
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
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' }
          }
        } }
      ];
      const docs = await attempts.aggregate(pipeline).toArray();
      res.status(200).json({ results: docs.map(d => ({ id: d._id.toString(), ...d })) });
    } catch (err) {
      console.error('Tutor results error:', err);
      res.status(500).json({ error: err.message || 'Failed to list results' });
    }
  });

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
          date: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } }
        } }
      ];
      const docs = await attempts.aggregate(pipeline).toArray();
      res.status(200).json({ results: docs.map(d => ({ id: d._id.toString(), ...d })) });
    } catch (err) {
      console.error('Student results error:', err);
      res.status(500).json({ error: err.message || 'Failed to list results' });
    }
  });

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