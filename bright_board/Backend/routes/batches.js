const express = require('express');
const Joi = require('joi');
const { authenticate } = require('../middleware/auth');
const { ObjectId } = require('mongodb');

module.exports = (db) => {
  const router = express.Router();
  const batchesCollection = db.collection('batches');
  const institutesCollection = db.collection('institutes');

  // Validation schemas
  const createBatchSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    course: Joi.string().required(),
    startDate: Joi.date().min('now').required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
    capacity: Joi.number().integer().min(1).max(500).required()
  });

  const updateBatchSchema = Joi.object({
    name: Joi.string().min(3).max(100),
    course: Joi.string(),
    startDate: Joi.date().min('now'),
    endDate: Joi.date().min(Joi.ref('startDate')),
    capacity: Joi.number().integer().min(1).max(500)
  });

  // Create batch (protected - institute only)
  router.post('/', authenticate, async (req, res) => {
    try {
      const { error } = createBatchSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { name, course, startDate, endDate, capacity } = req.body;
      const instituteId = req.user.instituteId;

      // Check if course is offered by institute
      const institute = await institutesCollection.findOne({ _id: new ObjectId(instituteId) });
      if (!institute || !institute.coursesOffered.includes(course)) {
        return res.status(400).json({ error: 'Course not offered by this institute' });
      }

      // Generate custom batchId per institute (e.g., BATCH0001)
      const count = await batchesCollection.countDocuments({ instituteId: new ObjectId(instituteId) });
      const customBatchId = `BATCH${String(count + 1).padStart(4, '0')}`;

      // Create batch
      const batch = {
        instituteId: new ObjectId(instituteId),
        batchId: customBatchId,  // Custom string ID
        name,
        course,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        capacity,
        currentEnrollment: 0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await batchesCollection.insertOne(batch);

      // Add batch to institute's batches list
      await institutesCollection.updateOne(
        { _id: new ObjectId(instituteId) },
        {
          $push: { batches: result.insertedId },
          $set: { updatedAt: new Date() }
        }
      );

      res.status(201).json({
        message: 'Batch created successfully',
        batchId: customBatchId,
        batch: {
          id: result.insertedId.toString(),
          batchId: customBatchId,
          name,
          course,
          startDate: batch.startDate,
          endDate: batch.endDate,
          capacity,
          currentEnrollment: 0
        }
      });
    } catch (error) {
      console.error('Create batch error:', error);
      res.status(500).json({ error: error.message || 'Failed to create batch' });
    }
  });

  // Get all batches for an institute (protected - institute only)
  router.get('/', authenticate, async (req, res) => {
    try {
      const instituteId = req.user.instituteId;
      const { course, status, page = 1, limit = 10 } = req.query;

      const query = { instituteId: new ObjectId(instituteId) };

      if (course) query.course = course;
      if (status) query.status = status;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const batches = await batchesCollection
        .find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .toArray();

      const total = await batchesCollection.countDocuments(query);

      res.status(200).json({
        batches,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get batches error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch batches' });
    }
  });

  // Get single batch (protected - institute only)
  router.get('/:id', authenticate, async (req, res) => {
    try {
      const instituteId = req.user.instituteId;
      const batchId = req.params.id;  // Using ObjectId for route param

      const batch = await batchesCollection.findOne(
        {
          _id: new ObjectId(batchId),
          instituteId: new ObjectId(instituteId)
        }
      );

      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      res.status(200).json({ batch });
    } catch (error) {
      console.error('Get batch error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch batch' });
    }
  });

  // Update batch (protected - institute only)
  router.put('/:id', authenticate, async (req, res) => {
    try {
      const { error } = updateBatchSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const instituteId = req.user.instituteId;
      const batchId = req.params.id;

      const updateData = { ...req.body, updatedAt: new Date() };
      if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
      if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

      const result = await batchesCollection.updateOne(
        {
          _id: new ObjectId(batchId),
          instituteId: new ObjectId(instituteId)
        },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      res.status(200).json({ message: 'Batch updated successfully' });
    } catch (error) {
      console.error('Update batch error:', error);
      res.status(500).json({ error: error.message || 'Failed to update batch' });
    }
  });

  // Delete batch (protected - institute only) - Note: This doesn't handle enrolled students; add logic if needed
  router.delete('/:id', authenticate, async (req, res) => {
    try {
      const instituteId = req.user.instituteId;
      const batchId = req.params.id;

      const result = await batchesCollection.deleteOne({
        _id: new ObjectId(batchId),
        instituteId: new ObjectId(instituteId)
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      // Remove from institute's batches list
      await institutesCollection.updateOne(
        { _id: new ObjectId(instituteId) },
        {
          $pull: { batches: new ObjectId(batchId) },
          $set: { updatedAt: new Date() }
        }
      );

      res.status(200).json({ message: 'Batch deleted successfully' });
    } catch (error) {
      console.error('Delete batch error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete batch' });
    }
  });

  return router;
};