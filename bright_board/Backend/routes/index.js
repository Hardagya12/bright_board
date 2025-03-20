const express = require('express');
const router = express.Router();

module.exports = function(db) {
  // Import route handlers
  const instituteRoutes = require('./institutes')(db);
  const studentRoutes = require('./students')(db);
  const batchRoutes = require('./batches')(db);
  const userRoutes = require('./users')(db);
  const supportRoutes = require('./support')(db);

  // Mount routes
  router.use('/institutes', instituteRoutes);
  router.use('/students', studentRoutes);
  router.use('/batches', batchRoutes);
  router.use('/users', userRoutes);
  router.use('/support', supportRoutes);

  return router;
};