const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "e!3@B1y#i9$u&8mNpXz2LqA0V";

// Generic auth middleware
const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    res.status(500).json({ error: "Authentication error" });
  }
};

// Role-based middleware
const requireRole = (role) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.roles || !req.user.roles.includes(role)) {
        return res.status(403).json({ error: `Access denied. ${role} role required.` });
      }
      next();
    } catch (err) {
      res.status(500).json({ error: "Role verification error" });
    }
  };
};

module.exports = {
  auth,
  requireRole
};