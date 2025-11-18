const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

const generateVerificationToken = (email) => {
  return jwt.sign({ email, type: 'verification' }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
};

const generateResetToken = (email) => {
  return jwt.sign({ email, type: 'reset' }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
};

module.exports = {
  generateToken,
  verifyToken,
  generateVerificationToken,
  generateResetToken
};
