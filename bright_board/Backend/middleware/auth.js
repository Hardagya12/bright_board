const { verifyToken } = require('../utils/jwt');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const verifyEmailToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No verification token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (decoded.type !== 'verification') {
      return res.status(401).json({ error: 'Invalid verification token' });
    }

    req.verifiedEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired verification token' });
  }
};

const verifyResetToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No reset token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (decoded.type !== 'reset') {
      return res.status(401).json({ error: 'Invalid reset token' });
    }

    req.resetEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired reset token' });
  }
};

module.exports = {
  authenticate,
  verifyEmailToken,
  verifyResetToken,
  requireInstitute: (req, res, next) => {
    try {
      const u = req.user || {};
      const role = u.role || (u.studentId ? 'student' : 'admin');
      if (role !== 'admin') {
        return res.status(403).json({ error: 'Only institutes can access this resource' });
      }
      next();
    } catch (err) {
      return res.status(403).json({ error: 'Access denied' });
    }
  },
  requireStudent: (req, res, next) => {
    try {
      const u = req.user || {};
      const role = u.role || (u.studentId ? 'student' : 'admin');
      if (role !== 'student') {
        return res.status(403).json({ error: 'Only students can access this resource' });
      }
      next();
    } catch (err) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }
};
