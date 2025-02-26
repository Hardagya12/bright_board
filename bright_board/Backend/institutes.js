const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const auth = require('./middleware/auth');
const router = express.Router();

const uri = process.env.MONGO_URI;
const dbName = "bright_board";

async function getDbClient() {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();
    return client.db(dbName);
}

// Validation Schemas
const instituteSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    address: Joi.string().min(5).max(200).required(),
    contactNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    coursesOffered: Joi.array().items(Joi.string()).optional()
});

const otpSchema = Joi.string().length(6).pattern(/^\d+$/).required();

// Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Add to .env
        pass: process.env.EMAIL_PASS  // Add to .env (App Password)
    }
});

// Generate OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
const sendOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Bright Board Registration',
        text: `Your OTP is: ${otp}. It expires in 5 minutes.`
    };

    return transporter.sendMail(mailOptions);
};

// **Signup - Step 1: Send OTP**
router.post('/signup/send-otp', async (req, res) => {
    const { error } = instituteSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const db = await getDbClient();
        const { name, address, contactNumber, email, password, coursesOffered } = req.body;

        // Check if institute already exists
        const existingInstitute = await db.collection('institutes').findOne({ email });
        if (existingInstitute) return res.status(400).json({ error: 'Institute already exists' });

        // Generate and store OTP with expiration
        const otp = generateOtp();
        const otpDoc = {
            email,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
            formData: { name, address, contactNumber, email, password, coursesOffered }
        };

        await db.collection('otps').deleteMany({ email }); // Remove any existing OTPs for this email
        await db.collection('otps').insertOne(otpDoc);

        // Send OTP
        await sendOtpEmail(email, otp);
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// **Signup - Step 2: Verify OTP and Complete Registration**
router.post('/signup/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    const { error } = otpSchema.validate(otp);
    if (error) return res.status(400).json({ error: error.message });

    try {
        const db = await getDbClient();
        const otpDoc = await db.collection('otps').findOne({ email, otp });

        if (!otpDoc) return res.status(400).json({ error: 'Invalid OTP' });
        if (new Date() > otpDoc.expiresAt) {
            await db.collection('otps').deleteOne({ email, otp });
            return res.status(400).json({ error: 'OTP has expired' });
        }

        const { name, address, contactNumber, email: otpEmail, password, coursesOffered } = otpDoc.formData;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate instituteId
        const count = await db.collection('institutes').countDocuments();
        const newInstituteId = `INST${(count + 1).toString().padStart(3, '0')}`;

        const newInstitute = {
            name,
            instituteId: newInstituteId,
            address,
            contactNumber,
            email: otpEmail,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: "Active",
            coursesOffered: coursesOffered || []
        };

        await db.collection('institutes').insertOne(newInstitute);
        await db.collection('otps').deleteOne({ email, otp }); // Clean up OTP

        res.status(201).json({ message: "Institute registered successfully", instituteId: newInstituteId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// **Sign in**
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const db = await getDbClient();
        const institute = await db.collection('institutes').findOne({ email });
        
        if (!institute) return res.status(400).json({ error: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, institute.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

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

        if (!institute) return res.status(404).json({ error: 'Institute not found' });
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

        if (!updatedInstitute.value) return res.status(404).json({ error: 'Institute not found or already deleted' });
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

        if (!result.value) return res.status(404).json({ error: 'Institute not found or already deleted' });
        res.status(200).json({ message: 'Institute soft deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;