const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || "e!3@B1y#i9$u&8mNpXz2LqA0V";

module.exports = function (db) {
    const router = express.Router();
    const users = db.collection("users");

    // **POST: User Registration (Sign-Up)**
    router.post('/signup', async (req, res) => {
        try {
            const { name, email, password, instituteId } = req.body;

            if (!name || !email || !password || !instituteId) {
                return res.status(400).json({ error: "All fields (name, email, password, instituteId) are required" });
            }

            // Check if user already exists
            const existingUser = await users.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: "User already exists with this email" });
            }

            // Hash password before storing
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = { name, email, password: hashedPassword, instituteId, createdAt: new Date() };

            // Insert user into DB
            const result = await users.insertOne(newUser);

            res.status(201).json({ message: "User registered successfully", userId: result.insertedId });
        } catch (err) {
            res.status(500).json({ error: "Error registering user: " + err.message });
        }
    });

    // **POST: User Login (Sign-In)**
    router.post('/signin', async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: "Email and password are required" });
            }

            // Check if user exists
            const user = await users.findOne({ email });
            if (!user) {
                return res.status(400).json({ error: "Invalid email or password" });
            }

            // Compare password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: "Invalid email or password" });
            }

            // Generate JWT token with name and instituteId
            const token = jwt.sign(
                { userId: user._id, name: user.name, email: user.email, instituteId: user.instituteId },
                JWT_SECRET,
                { expiresIn: "1h" }
            );

            res.status(200).json({ message: "Login successful", token, name: user.name, instituteId: user.instituteId });
        } catch (err) {
            res.status(500).json({ error: "Error logging in: " + err.message });
        }
    });

    // **GET: Fetch All Users (For Admin)**
    router.get('/', async (req, res) => {
        try {
            const allUsers = await users.find().project({ password: 0 }).toArray(); // Exclude passwords
            res.status(200).json(allUsers);
        } catch (err) {
            res.status(500).json({ error: "Error fetching users: " + err.message });
        }
    });

    return router;
};
