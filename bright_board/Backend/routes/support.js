const express = require('express');
const Joi = require('joi');
const { authenticate } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();
  const supportCollection = db.collection('support_tickets');
  const { ObjectId } = require('mongodb');

  // Validation schemas
  const createTicketSchema = Joi.object({
    subject: Joi.string().min(5).max(100).required(),
    message: Joi.string().min(10).max(1000).required(),
    category: Joi.string().valid('technical', 'billing', 'general', 'feature-request').required()
  });

  const updateTicketSchema = Joi.object({
    status: Joi.string().valid('open', 'in-progress', 'resolved', 'closed').required()
  });

  const replySchema = Joi.object({
    message: Joi.string().min(1).max(1000).required()
  });

  // Create support ticket (protected)
  router.post('/', authenticate, async (req, res) => {
    try {
      const { error } = createTicketSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { subject, message, category } = req.body;

      const ticket = {
        instituteId: new ObjectId(req.user.instituteId),
        instituteName: req.user.name,
        instituteEmail: req.user.email,
        subject,
        message,
        category,
        status: 'open',
        replies: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await supportCollection.insertOne(ticket);

      res.status(201).json({
        message: 'Support ticket created successfully',
        ticketId: result.insertedId.toString(),
        ticket: {
          id: result.insertedId.toString(),
          subject,
          category,
          status: 'open',
          createdAt: ticket.createdAt
        }
      });
    } catch (error) {
      console.error('Create ticket error:', error);
      res.status(500).json({ error: error.message || 'Failed to create support ticket' });
    }
  });

  // Get all tickets for an institute (protected)
  router.get('/', authenticate, async (req, res) => {
    try {
      const instituteId = req.user.instituteId;
      const { status, category, page = 1, limit = 10 } = req.query;

      const query = { instituteId: new ObjectId(instituteId) };

      if (status) query.status = status;
      if (category) query.category = category;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const tickets = await supportCollection
        .find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .toArray();

      const total = await supportCollection.countDocuments(query);

      res.status(200).json({
        tickets: tickets.map(t => ({
          ...t,
          id: t._id.toString()
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get tickets error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch support tickets' });
    }
  });

  // Get single ticket (protected)
  router.get('/:id', authenticate, async (req, res) => {
    try {
      const instituteId = req.user.instituteId;
      const ticketId = req.params.id;

      const ticket = await supportCollection.findOne({
        _id: new ObjectId(ticketId),
        instituteId: new ObjectId(instituteId)
      });

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      res.status(200).json({
        ticket: {
          ...ticket,
          id: ticket._id.toString()
        }
      });
    } catch (error) {
      console.error('Get ticket error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch ticket' });
    }
  });

  // Add reply to ticket (protected)
  router.post('/:id/replies', authenticate, async (req, res) => {
    try {
      const { error } = replySchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const instituteId = req.user.instituteId;
      const ticketId = req.params.id;
      const { message } = req.body;

      const reply = {
        from: 'institute',
        name: req.user.name,
        message,
        createdAt: new Date()
      };

      const result = await supportCollection.updateOne(
        {
          _id: new ObjectId(ticketId),
          instituteId: new ObjectId(instituteId)
        },
        {
          $push: { replies: reply },
          $set: { updatedAt: new Date() }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      res.status(200).json({ message: 'Reply added successfully', reply });
    } catch (error) {
      console.error('Add reply error:', error);
      res.status(500).json({ error: error.message || 'Failed to add reply' });
    }
  });

  // Update ticket status (protected)
  router.put('/:id/status', authenticate, async (req, res) => {
    try {
      const { error } = updateTicketSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const instituteId = req.user.instituteId;
      const ticketId = req.params.id;
      const { status } = req.body;

      const result = await supportCollection.updateOne(
        {
          _id: new ObjectId(ticketId),
          instituteId: new ObjectId(instituteId)
        },
        {
          $set: {
            status,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      res.status(200).json({ message: 'Ticket status updated successfully' });
    } catch (error) {
      console.error('Update ticket status error:', error);
      res.status(500).json({ error: error.message || 'Failed to update ticket status' });
    }
  });

  return router;
};
