// routes/institutes.js
const express = require('express');
const { MongoClient } = require('mongodb');
const router = express.Router();

// MongoDB connection details
const uri = process.env.MONGO_URI; // Use the environment variable
const dbName = "bright_board";

async function getDbClient() {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();
    return client.db(dbName);
}

// Create a new institute
router.post('/', async (req, res) => {
    try {
        const { name, address, contactNumber, email } = req.body;

        const db = await getDbClient();
        const newInstitute = { name, address, contactNumber, email };
        
        const result = await db.collection('institutes').insertOne(newInstitute);
        res.status(201).json(result.ops[0]); // Return the newly created institute
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all institutes
router.get('/', async (req, res) => {
    try {
        const db = await getDbClient();
        const institutes = await db.collection('institutes').find().toArray();
        res.status(200).json(institutes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific institute by ID
router.get('/:id', async (req, res) => {
    try {
        const db = await getDbClient();
        const institute = await db.collection('institutes').findOne({ _id: new MongoClient.ObjectId(req.params.id) });
        
        if (!institute) {
            return res.status(404).json({ error: 'Institute not found' });
        }
        res.status(200).json(institute);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an institute by ID
router.put('/:id', async (req, res) => {
    try {
        const { name, address, contactNumber, email } = req.body;
        const db = await getDbClient();

        const updatedInstitute = await db.collection('institutes').findOneAndUpdate(
            { _id: new MongoClient.ObjectId(req.params.id) },
            { $set: { name, address, contactNumber, email } },
            { returnOriginal: false }
        );

        if (!updatedInstitute.value) {
            return res.status(404).json({ error: 'Institute not found' });
        }

        res.status(200).json(updatedInstitute.value);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an institute by ID
router.delete('/:id', async (req, res) => {
    try {
        const db = await getDbClient();
        const deletedInstitute = await db.collection('institutes').findOneAndDelete({ _id: new MongoClient.ObjectId(req.params.id) });

        if (!deletedInstitute.value) {
            return res.status(404).json({ error: 'Institute not found' });
        }

        res.status(200).json({ message: 'Institute deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
