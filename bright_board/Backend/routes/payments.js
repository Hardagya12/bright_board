const express = require('express');
const Joi = require('joi');
const { authenticate, requireInstitute } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();
  const payments = db.collection('payments');
  const { ObjectId } = require('mongodb');

  const addSchema = Joi.object({
    studentName: Joi.string().min(2).max(200).required(),
    batch: Joi.string().allow('').optional(),
    amount: Joi.number().min(0).required(),
    method: Joi.string().valid('Cash', 'Card', 'UPI', 'PayPal', 'Credit Card').required(),
    date: Joi.string().isoDate().required(),
    status: Joi.string().valid('Completed', 'Pending', 'Failed').required(),
  });

  router.get('/payments/summary', authenticate, requireInstitute, async (req, res) => {
    try {
      
      const instituteId = new ObjectId(req.user.instituteId);
      const agg = await payments.aggregate([
        { $match: { instituteId } },
        { $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        } }
      ]).toArray();
      let revenue = 0; let successfulTransactions = 0; let pendingPayments = 0;
      for (const a of agg) {
        if (a._id === 'Completed') { revenue += a.total; successfulTransactions += a.count; }
        if (a._id === 'Pending') { pendingPayments += a.count; }
      }
      const monthlyData = await payments.aggregate([
        { $match: { instituteId } },
        { $group: { _id: { $substr: ['$date', 0, 7] }, revenue: { $sum: '$amount' } } },
        { $sort: { _id: 1 } }
      ]).toArray();
      const batchData = await payments.aggregate([
        { $match: { instituteId } },
        { $group: { _id: '$batch', revenue: { $sum: '$amount' } } },
        { $sort: { revenue: -1 } }
      ]).toArray();
      const paymentStats = [
        { name: 'Successful', value: successfulTransactions },
        { name: 'Failed', value: agg.find(a => a._id === 'Failed')?.count || 0 },
        { name: 'Pending', value: pendingPayments },
      ];
      res.status(200).json({
        revenue,
        pendingPayments,
        successfulTransactions,
        monthlyData: monthlyData.map(m => ({ month: m._id, revenue: m.revenue })),
        batchData: batchData.map(b => ({ name: b._id || 'Unknown', revenue: b.revenue })),
        paymentStats,
      });
    } catch (err) {
      console.error('Payments summary error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch summary' });
    }
  });

  router.get('/payments/transactions', authenticate, requireInstitute, async (req, res) => {
    try {
      
      const instituteId = new ObjectId(req.user.instituteId);
      const { status, start, end, studentName } = req.query;
      const query = { instituteId };
      if (status) query.status = status;
      if (start) query.date = { ...(query.date || {}), $gte: start };
      if (end) query.date = { ...(query.date || {}), $lte: end };
      if (studentName) query.studentName = studentName;
      const docs = await payments.find(query).sort({ date: -1 }).limit(200).toArray();
      res.status(200).json({ transactions: docs.map(d => ({
        id: d._id.toString(),
        studentName: d.studentName,
        batch: d.batch,
        amount: d.amount,
        method: d.method,
        date: d.date,
        status: d.status,
      })) });
    } catch (err) {
      console.error('Payments transactions error:', err);
      res.status(500).json({ error: err.message || 'Failed to list transactions' });
    }
  });

  router.post('/payments', authenticate, requireInstitute, async (req, res) => {
    try {
      
      const { error, value } = addSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });
      const instituteId = new ObjectId(req.user.instituteId);
      const doc = {
        instituteId,
        studentName: value.studentName,
        batch: value.batch || 'General',
        amount: value.amount,
        method: value.method,
        date: value.date,
        status: value.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await payments.insertOne(doc);
      res.status(201).json({ message: 'Payment added', id: result.insertedId.toString() });
    } catch (err) {
      console.error('Create payment error:', err);
      res.status(500).json({ error: err.message || 'Failed to add payment' });
    }
  });

  return router;
};