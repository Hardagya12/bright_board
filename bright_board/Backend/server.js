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

async function initializeDatabase() {
    try {
        const client = new MongoClient(uri);
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db(dbName);

        // Use routes correctly
        app.use('/users', require('./routes/users')(db));
        app.use('/support', require('./routes/support')(db));

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
