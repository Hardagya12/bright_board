const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || "e!3@B1y#i9$u&8mNpXz2LqA0V";

module.exports = function (req, res, next) {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Access Denied. No token provided." });
    }

    try {
        // Extract token (remove "Bearer ")
        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach user details to the request
        req.user = decoded;

        // Move to the next middleware/route handler
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid or expired token." });
    }
};
