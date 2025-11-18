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

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    console.error('Please check your .env file');
    process.exit(1);
}

const dbName = "bright_board";

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

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

        // Create indexes for better performance
        await db.collection('institutes').createIndex({ email: 1 }, { unique: true });
        await db.collection('students').createIndex({ email: 1, instituteId: 1 }, { unique: true });
        await db.collection('otps').createIndex({ email: 1, type: 1 });
        await db.collection('otps').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
        // New indexes for batches
        await db.collection('batches').createIndex({ batchId: 1 }, { unique: true });
        await db.collection('batches').createIndex({ instituteId: 1 });
        await db.collection('students').createIndex({ batchId: 1 });  // For faster batch filtering
        // Indexes for exams system
        await db.collection('exams').createIndex({ instituteId: 1, published: 1 });
        await db.collection('questions').createIndex({ examId: 1 });
        await db.collection('student_exam_attempts').createIndex({ examId: 1, studentId: 1 }, { unique: true });


        console.log("Database indexes created");
        // API routes
        app.use('/institutes', require('./routes/institutes')(db));
        app.use('/students', require('./routes/students')(db));
        app.use('/batches', require('./routes/batches')(db));
        app.use('/support', require('./routes/support')(db));
        app.use('/users', require('./routes/users')(db));
        // Exams routes
        app.use('/', require('./routes/exams')(db));

        // 404 handler
        app.use((req, res) => {
            res.status(404).json({ error: 'Route not found' });
        });

        // Global error handler
        app.use((err, req, res, next) => {
            console.error('Global error handler:', err);
            res.status(500).json({
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        });

        // Handle MongoDB disconnection
        process.on('SIGINT', async () => {
            if (client) {
                await client.close();
                console.log("MongoDB connection closed");
            }
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            if (client) {
                await client.close();
                console.log("MongoDB connection closed");
            }
            process.exit(0);
        });

        // Start the server
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
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
