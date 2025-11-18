const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // Placeholder route - can be extended for admin users or other user types
  router.get('/health', (req, res) => {
    res.status(200).json({ message: 'Users route is healthy' });
  });

  return router;
};
