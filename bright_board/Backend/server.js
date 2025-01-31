const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// MongoDB connection details
const uri = process.env.MONGO_URI; // Use the environment variable
const dbName = "bright_board";

// Middleware
app.use(cors());
app.use(express.json());

async function initializeDatabase() {
    try {
        const client = new MongoClient(uri, {
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Increase the timeout value
        });
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db(dbName);

        // Use routes correctly
        app.use('/users', require('./users')(db));
        app.use('/support', require('./support')(db));
        app.use('/institutes', require('./institutes')); // Import and use the institutes router

        // Handle MongoDB disconnection properly
        process.on('SIGINT', async () => {
            await client.close();
            console.log("MongoDB connection closed");
            process.exit(0);
        });

        // Start the server
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });

    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

// Initialize the database
initializeDatabase();
