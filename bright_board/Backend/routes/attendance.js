const express = require('express');
const Joi = require('joi');
const { authenticate, requireInstitute } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();
  const logs = db.collection('attendance_logs');
  const { ObjectId } = require('mongodb');

  const bulkSchema = Joi.object({
    date: Joi.string().isoDate().required(),
    batchId: Joi.string().optional().allow(null, ''),
    entries: Joi.array().items(Joi.object({
      studentId: Joi.string().required(),
      status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
      reason: Joi.string().max(200).optional().allow('', null)
    })).min(1).required(),
  });

  router.get('/attendance', authenticate, requireInstitute, async (req, res) => {
    try {
      
      const instituteId = new ObjectId(req.user.instituteId);
      const { date, batchId } = req.query;
      const query = { instituteId };
      if (date) query.date = date;
      if (batchId) query.batchId = batchId;
      const docs = await logs.find(query).sort({ date: -1 }).toArray();
      res.status(200).json({ attendance: docs.map(d => ({ ...d, id: d._id.toString() })) });
    } catch (err) {
      console.error('List attendance error:', err);
      res.status(500).json({ error: err.message || 'Failed to list attendance' });
    }
  });

  router.post('/attendance/bulk', authenticate, requireInstitute, async (req, res) => {
    try {
      
      const { error, value } = bulkSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });
      const instituteId = new ObjectId(req.user.instituteId);
      const date = value.date;
      const batchId = value.batchId || null;
      const entries = value.entries.map(e => ({
        instituteId,
        date,
        batchId,
        studentId: e.studentId,
        status: e.status,
        reason: e.reason || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      if (entries.length === 0) return res.status(400).json({ error: 'No entries provided' });
      await logs.insertMany(entries);
      res.status(201).json({ message: 'Attendance uploaded', count: entries.length });
    } catch (err) {
      console.error('Bulk attendance error:', err);
      res.status(500).json({ error: err.message || 'Failed to upload attendance' });
    }
  });

  router.get('/attendance/stats', authenticate, requireInstitute, async (req, res) => {
    try {
      
      const instituteId = new ObjectId(req.user.instituteId);
      const { range = 'week' } = req.query;
      const match = { instituteId };
      const pipeline = [
        { $match: match },
        { $group: { _id: { date: '$date', status: '$status' }, count: { $sum: 1 } } },
        { $group: { _id: '$_id.date', totals: { $push: { status: '$_id.status', count: '$count' } }, total: { $sum: '$count' } } },
        { $sort: { _id: 1 } },
      ];
      const agg = await logs.aggregate(pipeline).toArray();
      const weekly = agg.slice(-5).map(d => {
        const present = d.totals.find(t => t.status === 'present')?.count || 0;
        const attendance = d.total ? Math.round((present / d.total) * 100) : 0;
        return { name: d._id, attendance };
      });
      const monthly = agg.slice(-20).reduce((acc, d) => {
        const month = d._id?.substring(0, 7) || 'Unknown';
        if (!acc[month]) acc[month] = { month, present: 0, absent: 0 };
        d.totals.forEach(t => {
          if (t.status === 'present') acc[month].present += t.count;
          if (t.status === 'absent') acc[month].absent += t.count;
        });
        return acc;
      }, {});
      res.status(200).json({ weekly: weekly, monthly: Object.values(monthly) });
    } catch (err) {
      console.error('Attendance stats error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch stats' });
    }
  });

  return router;
};