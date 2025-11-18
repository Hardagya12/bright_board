const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { generateOTP, getOTPExpiry } = require('../utils/otp');
const { sendOTPEmail, sendPasswordResetOTP } = require('../utils/email');
const { generateToken, generateVerificationToken, generateResetToken } = require('../utils/jwt');
const { verifyEmailToken, verifyResetToken, authenticate } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();
  const institutesCollection = db.collection('institutes');
  const otpCollection = db.collection('otps');

  // Validation schemas
  const emailSchema = Joi.object({
    email: Joi.string().email().required()
  });

  const otpVerificationSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required()
  });

  const signupSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    address: Joi.string().min(5).max(200).required(),
    contactNumber: Joi.string().pattern(/^\d{10}$/).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    coursesOffered: Joi.array().items(Joi.string()).min(1).required()
  });

  const signinSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const resetPasswordSchema = Joi.object({
    newPassword: Joi.string().min(6).required()
  });

  // Request OTP for email verification
  router.post('/request-otp', async (req, res) => {
    try {
      const { error } = emailSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { email } = req.body;

      // Check if institute already exists
      const existingInstitute = await institutesCollection.findOne({ email });
      if (existingInstitute) {
        return res.status(400).json({ error: 'Institute with this email already exists' });
      }

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = getOTPExpiry();

      // Store OTP in database
      await otpCollection.updateOne(
        { email },
        {
          $set: {
            email,
            otp,
            expiresAt,
            verified: false,
            type: 'registration',
            createdAt: new Date()
          }
        },
        { upsert: true }
      );

      // Send OTP via email
      await sendOTPEmail(email, otp);

      res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
      console.error('Request OTP error:', error);
      res.status(500).json({ error: error.message || 'Failed to send OTP' });
    }
  });

  // Verify OTP
  router.post('/verify-otp', async (req, res) => {
    try {
      const { error } = otpVerificationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { email, otp } = req.body;

      // Find OTP record
      const otpRecord = await otpCollection.findOne({ email, type: 'registration' });

      if (!otpRecord) {
        return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
      }

      if (otpRecord.verified) {
        return res.status(400).json({ error: 'OTP already verified' });
      }

      if (new Date() > new Date(otpRecord.expiresAt)) {
        return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
      }

      if (otpRecord.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      // Mark OTP as verified
      await otpCollection.updateOne(
        { email, type: 'registration' },
        { $set: { verified: true } }
      );

      // Generate verification token
      const verificationToken = generateVerificationToken(email);

      res.status(200).json({
        message: 'Email verified successfully',
        verificationToken
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ error: error.message || 'Failed to verify OTP' });
    }
  });

  // Complete registration
  router.post('/signup', verifyEmailToken, async (req, res) => {
    try {
      const { error } = signupSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { name, address, contactNumber, email, password, coursesOffered } = req.body;

      // Verify email matches the verified token
      if (email !== req.verifiedEmail) {
        return res.status(400).json({ error: 'Email does not match verified email' });
      }

      // Check if OTP was verified
      const otpRecord = await otpCollection.findOne({ email, type: 'registration', verified: true });
      if (!otpRecord) {
        return res.status(400).json({ error: 'Email not verified. Please verify your email first.' });
      }

      // Check if institute already exists
      const existingInstitute = await institutesCollection.findOne({ email });
      if (existingInstitute) {
        return res.status(400).json({ error: 'Institute with this email already exists' });
      }

      // Generate custom instituteId (e.g., INST0001)
      const count = await institutesCollection.countDocuments({});
      const customInstituteId = `INST${String(count + 1).padStart(4, '0')}`;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create institute
      const institute = {
        instituteId: customInstituteId,  // Custom string ID
        name,
        address,
        contactNumber,
        email,
        password: hashedPassword,
        coursesOffered,
        students: [],
        batches: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await institutesCollection.insertOne(institute);

      // Delete used OTP
      await otpCollection.deleteOne({ email, type: 'registration' });

      // Generate JWT token (using _id for internal auth, but return custom ID)
      const token = generateToken({
        instituteId: result.insertedId.toString(),  // Internal ObjectId for auth
        email,
        name
      });

      res.status(201).json({
        message: 'Institute registered successfully',
        token,
        instituteId: customInstituteId,  // Custom ID
        institute: {
          id: customInstituteId,
          name,
          email,
          address,
          contactNumber,
          coursesOffered
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: error.message || 'Registration failed' });
    }
  });

  // ... (rest of the file remains unchanged: signin, password reset, profile routes)
  // Sign in
  router.post('/signin', async (req, res) => {
    try {
      const { error } = signinSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { email, password } = req.body;

      // Find institute
      const institute = await institutesCollection.findOne({ email });
      if (!institute) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, institute.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = generateToken({
        instituteId: institute._id.toString(),
        email: institute.email,
        name: institute.name
      });

      res.status(200).json({
        message: 'Login successful',
        token,
        instituteId: institute.instituteId || institute._id.toString(),  // Prefer custom ID
        institute: {
          id: institute.instituteId || institute._id.toString(),
          name: institute.name,
          email: institute.email,
          address: institute.address,
          contactNumber: institute.contactNumber,
          coursesOffered: institute.coursesOffered
        }
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ error: error.message || 'Login failed' });
    }
  });

  // Request password reset OTP
  router.post('/request-password-reset', async (req, res) => {
    try {
      const { error } = emailSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { email } = req.body;

      // Check if institute exists
      const institute = await institutesCollection.findOne({ email });
      if (!institute) {
        return res.status(404).json({ error: 'No institute found with this email' });
      }

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = getOTPExpiry();

      // Store OTP in database
      await otpCollection.updateOne(
        { email },
        {
          $set: {
            email,
            otp,
            expiresAt,
            verified: false,
            type: 'password-reset',
            createdAt: new Date()
          }
        },
        { upsert: true }
      );

      // Send OTP via email
      await sendPasswordResetOTP(email, otp);

      res.status(200).json({ message: 'Password reset OTP sent successfully' });
    } catch (error) {
      console.error('Request password reset error:', error);
      res.status(500).json({ error: error.message || 'Failed to send password reset OTP' });
    }
  });

  // Verify password reset OTP
  router.post('/verify-reset-otp', async (req, res) => {
    try {
      const { error } = otpVerificationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { email, otp } = req.body;

      // Find OTP record
      const otpRecord = await otpCollection.findOne({ email, type: 'password-reset' });

      if (!otpRecord) {
        return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
      }

      if (otpRecord.verified) {
        return res.status(400).json({ error: 'OTP already verified' });
      }

      if (new Date() > new Date(otpRecord.expiresAt)) {
        return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
      }

      if (otpRecord.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      // Mark OTP as verified
      await otpCollection.updateOne(
        { email, type: 'password-reset' },
        { $set: { verified: true } }
      );

      // Generate reset token
      const resetToken = generateResetToken(email);

      res.status(200).json({
        message: 'OTP verified successfully',
        resetToken
      });
    } catch (error) {
      console.error('Verify reset OTP error:', error);
      res.status(500).json({ error: error.message || 'Failed to verify OTP' });
    }
  });

  // Reset password
  router.post('/reset-password', verifyResetToken, async (req, res) => {
    try {
      const { error } = resetPasswordSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { newPassword } = req.body;
      const email = req.resetEmail;

      // Check if OTP was verified
      const otpRecord = await otpCollection.findOne({ email, type: 'password-reset', verified: true });
      if (!otpRecord) {
        return res.status(400).json({ error: 'Reset token not verified' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      const result = await institutesCollection.updateOne(
        { email },
        {
          $set: {
            password: hashedPassword,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Institute not found' });
      }

      // Delete used OTP
      await otpCollection.deleteOne({ email, type: 'password-reset' });

      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: error.message || 'Failed to reset password' });
    }
  });

  // Get institute profile (protected route)
  router.get('/profile', authenticate, async (req, res) => {
    try {
      const { ObjectId } = require('mongodb');
      const institute = await institutesCollection.findOne(
        { _id: new ObjectId(req.user.instituteId) },
        { projection: { password: 0 } }
      );

      if (!institute) {
        return res.status(404).json({ error: 'Institute not found' });
      }

      res.status(200).json({ institute });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch profile' });
    }
  });

  // Update institute profile (protected route)
  router.put('/profile', authenticate, async (req, res) => {
    try {
      const updateSchema = Joi.object({
        name: Joi.string().min(3).max(50),
        address: Joi.string().min(5).max(200),
        contactNumber: Joi.string().pattern(/^\d{10}$/),
        coursesOffered: Joi.array().items(Joi.string()).min(1)
      });

      const { error } = updateSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { ObjectId } = require('mongodb');
      const updateData = { ...req.body, updatedAt: new Date() };

      const result = await institutesCollection.updateOne(
        { _id: new ObjectId(req.user.instituteId) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Institute not found' });
      }

      res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: error.message || 'Failed to update profile' });
    }
  });

  return router;
};