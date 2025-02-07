const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const Joi = require('joi');
const bcrypt = require('bcrypt'); // To hash passwords
const jwt = require('jsonwebtoken'); // To generate JWT
const auth = require('./middleware/auth'); // Authentication middleware
const router = express.Router();

const uri = process.env.MONGO_URI;
const dbName = "bright_board";

async function getDbClient() {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();
    return client.db(dbName);
}

// Validation Schema Using Joi
const instituteSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    address: Joi.string().min(5).max(200).required(),
    contactNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(), // Password validation
    coursesOffered: Joi.array().items(Joi.string()).optional()
});

// **Signup (create a new institute)**
router.post('/signup', async (req, res) => {
    const { error } = instituteSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const db = await getDbClient();
        const { name, address, contactNumber, email, password, coursesOffered } = req.body;

        // Check if institute already exists
        const existingInstitute = await db.collection('institutes').findOne({ email });
        if (existingInstitute) return res.status(400).json({ error: 'Institute already exists' });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a unique instituteId based on the count of existing institutes
        const count = await db.collection('institutes').countDocuments();
        const newInstituteId = `INST${(count + 1).toString().padStart(3, '0')}`; // e.g., INST001, INST002

        const newInstitute = {
            name,
            instituteId: newInstituteId, // Use the generated unique ID
            address,
            contactNumber,
            email,
            password: hashedPassword, // Store hashed password
            createdAt: new Date(),
            updatedAt: new Date(),
            status: "Active",
            coursesOffered: coursesOffered || []
        };

        await db.collection('institutes').insertOne(newInstitute);
        res.status(201).json({ message: "Institute registered successfully", instituteId: newInstituteId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// **Sign in for an institute**
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const db = await getDbClient();
        const institute = await db.collection('institutes').findOne({ email });
        
        if (!institute) return res.status(400).json({ error: 'Invalid email or password' });

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, institute.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

        // Generate JWT
        const token = jwt.sign({ userId: institute._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// **Get all institutes**
router.get('/', async (req, res) => {
    try {
        const db = await getDbClient();
        const institutes = await db.collection('institutes').find({ status: { $ne: "Deleted" } }).toArray();
        res.status(200).json(institutes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific institute by ID
router.get('/:id', async (req, res) => {
    try {
        const db = await getDbClient();
        const institute = await db.collection('institutes').findOne({ _id: new ObjectId(req.params.id), status: { $ne: "Deleted" } });

        if (!institute) {
            return res.status(404).json({ error: 'Institute not found' });
        }
        res.status(200).json(institute);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an institute by ID
router.put('/:id', auth, async (req, res) => {
    const { error } = instituteSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const db = await getDbClient();
        const { name, address, contactNumber, email, coursesOffered } = req.body;

        const updatedInstitute = await db.collection('institutes').findOneAndUpdate(
            { _id: new ObjectId(req.params.id), status: { $ne: "Deleted" } },
            { $set: { name, address, contactNumber, email, coursesOffered, updatedAt: new Date() } },
            { returnOriginal: false }
        );

        if (!updatedInstitute.value) {
            return res.status(404).json({ error: 'Institute not found or already deleted' });
        }

        res.status(200).json({ message: "Institute updated successfully", institute: updatedInstitute.value });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Soft delete an institute by ID
router.delete('/:id', auth, async (req, res) => {
    try {
        const db = await getDbClient();
        const result = await db.collection('institutes').findOneAndUpdate(
            { _id: new ObjectId(req.params.id), status: { $ne: "Deleted" } },
            { $set: { status: "Deleted", deletedAt: new Date() } },
            { returnOriginal: false }
        );

        if (!result.value) {
            return res.status(404).json({ error: 'Institute not found or already deleted' });
        }

        res.status(200).json({ message: 'Institute soft deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
