const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3000;

// MongoDB connection details
const uri = "mongodb+srv://rajputhardagya:1234@cluster0.pgaya.mongodb.net/";
const dbName = "bright_board";

// Middleware
app.use(cors());
app.use(express.json());

let db, support;

// Connect to MongoDB and initialize collections
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        support = db.collection("support"); // Initialize support collection

        // Start server after successful DB connection
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Exit if database connection fails
    }
}

// Initialize Database
initializeDatabase();

// POST: Submit a Support Request
app.post('/support', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Basic validation
        if (!name || !email || !message) {
            return res.status(400).send("All fields (name, email, message) are required");
        }

        // Save support request
        const supportRequest = { name, email, message, createdAt: new Date() };
        const result = await support.insertOne(supportRequest);

        res.status(201).send(`Support request created with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error submitting support request: " + err.message);
    }
});

// GET: Fetch all Support Requests (for admin use)
app.get('/support', async (req, res) => {
    try {
        const allRequests = await support.find().toArray();
        res.status(200).json(allRequests);
    } catch (err) {
        res.status(500).send("Error fetching support requests: " + err.message);
    }
});

// PATCH: Update a Support Request (optional, for admin updates)
app.patch('/support/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const result = await support.updateOne(
            { _id: new MongoClient.ObjectId(id) },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send("Support request not found");
        }

        res.status(200).send(`${result.modifiedCount} support request(s) updated`);
    } catch (err) {
        res.status(500).send("Error updating support request: " + err.message);
    }
});

// DELETE: Remove a Support Request (optional, for admin cleanup)
app.delete('/support/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await support.deleteOne({ _id: new MongoClient.ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).send("Support request not found");
        }

        res.status(200).send("Support request deleted successfully");
    } catch (err) {
        res.status(500).send("Error deleting support request: " + err.message);
    }
});
