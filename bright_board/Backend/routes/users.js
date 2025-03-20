const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth, requireRole } = require('../middleware/auth');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || "e!3@B1y#i9$u&8mNpXz2LqA0V";

module.exports = function (db) {
    const router = express.Router();
    const users = db.collection("users");

    // Helper function to generate user ID
    async function generateUserId() {
        const lastUser = await users
            .find()
            .sort({ _id: -1 })
            .limit(1)
            .toArray();

        let number = 1;
        if (lastUser.length > 0 && lastUser[0].userId) {
            const lastNumber = parseInt(lastUser[0].userId.replace('USER', ''));
            number = lastNumber + 1;
        }

        return `USER${number.toString().padStart(4, '0')}`;
    }

    // User Registration (Sign-Up)
    router.post('/signup', async (req, res) => {
        try {
            const { name, email, password, instituteId, role = 'user' } = req.body;

            if (!name || !email || !password || !instituteId) {
                return res.status(400).json({ error: "All fields are required" });
            }

            // Check if user already exists
            const existingUser = await users.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: "User already exists with this email" });
            }

            const userId = await generateUserId();
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const newUser = {
                userId,
                name,
                email,
                password: hashedPassword,
                instituteId,
                role,
                roles: [role],
                createdAt: new Date(),
                status: "Active"
            };

            await users.insertOne(newUser);

            const token = jwt.sign(
                { 
                    userId,
                    name,
                    email,
                    instituteId,
                    roles: [role]
                },
                JWT_SECRET,
                { expiresIn: "24h" }
            );

            res.status(201).json({
                message: "User registered successfully",
                userId,
                token
            });
        } catch (err) {
            res.status(500).json({ error: "Error registering user: " + err.message });
        }
    });

    // User Login (Sign-In)
    router.post('/signin', async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: "Email and password are required" });
            }

            const user = await users.findOne({ email });
            if (!user || user.status !== "Active") {
                return res.status(400).json({ error: "Invalid email or account not active" });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: "Invalid email or password" });
            }

            const token = jwt.sign(
                {
                    userId: user.userId,
                    name: user.name,
                    email: user.email,
                    instituteId: user.instituteId,
                    roles: user.roles
                },
                JWT_SECRET,
                { expiresIn: "24h" }
            );

            res.status(200).json({
                message: "Login successful",
                token,
                userId: user.userId,
                name: user.name,
                instituteId: user.instituteId,
                roles: user.roles
            });
        } catch (err) {
            res.status(500).json({ error: "Error logging in: " + err.message });
        }
    });

    // Get user profile
    router.get('/profile', auth, async (req, res) => {
        try {
            const user = await users.findOne(
                { userId: req.user.userId },
                { projection: { password: 0 } }
            );

            if (!user) {z
                return res.status(404).json({ error: "User not found" });
            }

            res.status(200).json(user);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Update user profile
    router.put('/profile', auth, async (req, res) => {
        try {
            const { name, contactNumber, address } = req.body;

            const updateData = {
                ...(name && { name }),
                ...(contactNumber && { contactNumber }),
                ...(address && { address }),
                updatedAt: new Date()
            };

            const result = await users.updateOne(
                { userId: req.user.userId },
                { $set: updateData }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            res.status(200).json({ message: "Profile updated successfully" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Change password
    router.put('/change-password', auth, async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: "Current password and new password are required" });
            }

            const user = await users.findOne({ userId: req.user.userId });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: "Current password is incorrect" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await users.updateOne(
                { userId: req.user.userId },
                { 
                    $set: { 
                        password: hashedPassword,
                        updatedAt: new Date()
                    }
                }
            );

            res.status(200).json({ message: "Password updated successfully" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Get all users (admin only)
    router.get('/', auth, requireRole('admin'), async (req, res) => {
        try {
            const allUsers = await users
                .find()
                .project({ password: 0 })
                .toArray();
            res.status(200).json(allUsers);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};