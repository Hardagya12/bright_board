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
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).send("All fields (name, email, password) are required");
            }

            // Check if user already exists
            const existingUser = await users.findOne({ email });
            if (existingUser) {
                return res.status(400).send("User already exists with this email");
            }

            // Hash password before storing
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = { name, email, password: hashedPassword, createdAt: new Date() };

            // Insert user into DB
            const result = await users.insertOne(newUser);

            res.status(201).send(`User registered successfully with ID: ${result.insertedId}`);
        } catch (err) {
            res.status(500).send("Error registering user: " + err.message);
        }
    });

    // **POST: User Login (Sign-In)**
    router.post('/signin', async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).send("Email and password are required");
            }

            // Check if user exists
            const user = await users.findOne({ email });
            if (!user) {
                return res.status(400).send("Invalid email or password");
            }

            // Compare password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).send("Invalid email or password");
            }

            // Generate JWT token
            const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

            res.status(200).json({ message: "Login successful", token });
        } catch (err) {
            res.status(500).send("Error logging in: " + err.message);
        }
    });

    // **GET: Fetch All Users (For Admin)**
    router.get('/', async (req, res) => {
        try {
            const allUsers = await users.find({}, { projection: { password: 0 } }).toArray(); // Exclude passwords
            res.status(200).json(allUsers);
        } catch (err) {
            res.status(500).send("Error fetching users: " + err.message);
        }
    });

    return router;
};
