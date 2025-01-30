const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// MongoDB connection details
const uri = "mongodb+srv://rajputhardagya:1234@cluster0.pgaya.mongodb.net/";
const dbName = "bright_board";

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB and share the connection
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        const db = client.db(dbName);

        // Pass the database to route files
        app.use('/support', require('./support')(db));
        app.use('/users', require('./users')(db));

        // Start the server
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });

    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

// Initialize the database and start the server
initializeDatabase();
