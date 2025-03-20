const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection details
const uri = process.env.MONGO_URI;
if (!uri) {
    console.error("MONGO_URI environment variable is not set");
    process.exit(1);
}

const dbName = "bright_board";

// Middleware
app.use(cors());
app.use(express.json());

async function initializeDatabase() {
    let client;
    try {
        client = new MongoClient(uri, {
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });
        
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db(dbName);

        // Use routes
        app.use('/users', require('./routes/users')(db));
        app.use('/support', require('./routes/support')(db));
        app.use('/institutes', require('./routes/institutes')(db));
        app.use('/students', require('./routes/students')(db));
        app.use('/batches', require('./routes/batches')(db));

        // Handle MongoDB disconnection
        process.on('SIGINT', async () => {
            if (client) {
                await client.close();
                console.log("MongoDB connection closed");
            }
            process.exit(0);
        });

        // Start the server
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });

    } catch (err) {
        console.error("Error connecting to MongoDB:", err.message);
        if (client) {
            await client.close();
        }
        process.exit(1);
    }
}

// Initialize the database
initializeDatabase().catch(console.error);