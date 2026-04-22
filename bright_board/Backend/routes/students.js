const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { authenticate, requireInstitute, requireStudent } = require('../middleware/auth');
const { generateToken } = require('../utils/jwt');

module.exports = (db) => {
  const router = express.Router();
  const studentsCollection = db.collection('students');
  const institutesCollection = db.collection('institutes');
  const batchesCollection = db.collection('batches');
  const { ObjectId } = require('mongodb');

  // Validation schemas
  const createStudentSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\d{10}$/).required(),
    dateOfBirth: Joi.date().required(),
    address: Joi.string().min(5).max(200).required(),
    course: Joi.string().required(),
    batchId: Joi.string().optional(),
    password: Joi.string().min(6).required()
  });

  // Updated: Schema for student self-registration (requires instituteId and batchId)
  const registerStudentSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\d{10}$/).required(),
    dateOfBirth: Joi.date().required(),
    address: Joi.string().min(5).max(200).required(),
    course: Joi.string().required(),
    instituteId: Joi.string().required().min(5),  // Custom string, e.g., "INST0001"
    batchId: Joi.string().required().min(5),  // Custom string, e.g., "BATCH0001"
    password: Joi.string().min(6).required()
  });

  const updateStudentSchema = Joi.object({
    name: Joi.string().min(2).max(50),
    phone: Joi.string().pattern(/^\d{10}$/),
    dateOfBirth: Joi.date(),
    address: Joi.string().min(5).max(200),
    course: Joi.string(),
    batchId: Joi.string()
  });

  const studentSigninSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const studentSigninByIdSchema = Joi.object({
    instituteId: Joi.string().min(5).required(),
    studentId: Joi.string().length(8).pattern(/^\d{8}$/).required(),
    password: Joi.string().required()
  });

  // Add student (protected - institute only)
  router.post('/', authenticate, requireInstitute, async (req, res) => {
    const session = studentsCollection.client.startSession();
    try {
      const { error } = createStudentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { name, email, phone, dateOfBirth, address, course, batchId, password } = req.body;
      const instituteId = req.user.instituteId;  // Internal ObjectId from auth

      await session.withTransaction(async () => {
        // Check if student email already exists for this institute
        const existingStudent = await studentsCollection.findOne({
          email,
          instituteId: new ObjectId(instituteId)
        }, { session });

        if (existingStudent) {
          throw new Error('Student with this email already exists');
        }

        // If batchId provided, validate it exists for this institute
        if (batchId) {
          const batch = await batchesCollection.findOne({
            batchId,
            instituteId: new ObjectId(instituteId)
          }, { session });
          if (!batch) {
            throw new Error('Invalid batchId for this institute');
          }
          if (batch.course !== course) {
            throw new Error('Course does not match batch course');
          }
          // Increment enrollment
          await batchesCollection.updateOne({ batchId }, { $inc: { currentEnrollment: 1 } }, { session });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate custom studentId: YYMM + 4-digit sequence per institute
        const now = new Date();
        const yy = String(now.getFullYear()).slice(2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const prefix = `${yy}${mm}`;
        const monthlyCount = await studentsCollection.countDocuments({
          instituteId: new ObjectId(instituteId),
          studentId: { $regex: `^${prefix}` }
        }, { session });
        const seq = String(monthlyCount + 1).padStart(4, '0');
        const customStudentId = `${prefix}${seq}`;

        // Create student
        const student = {
          instituteId: new ObjectId(instituteId),
          studentId: customStudentId,
          name,
          email,
          phone,
          dateOfBirth: new Date(dateOfBirth),
          address,
          course,
          batchId: batchId || null,
          password: hashedPassword,
          enrollmentDate: new Date(),
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await studentsCollection.insertOne(student, { session });

        // Add student to institute's student list
        await institutesCollection.updateOne(
          { _id: new ObjectId(instituteId) },
          {
            $push: { students: result.insertedId },
            $set: { updatedAt: new Date() }
          },
          { session }
        );

        res.status(201).json({
          message: 'Student added successfully',
          studentId: customStudentId,
          student: {
            id: customStudentId,
            name,
            email,
            phone,
            course,
            enrollmentDate: student.enrollmentDate,
            batchId
          }
        });
      });
    } catch (error) {
      console.error('Add student error:', error);
      if (error.message) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to add student' });
    } finally {
      await session.endSession();
    }
  });

  // Updated: Student self-registration using instituteId and batchId (public)
  router.post('/register', async (req, res) => {
    const session = studentsCollection.client.startSession();
    try {
      const { error } = registerStudentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { name, email, phone, dateOfBirth, address, course, instituteId: customInstituteId, batchId, password } = req.body;

      await session.withTransaction(async () => {
        // Find institute by custom instituteId (string)
        const institute = await institutesCollection.findOne({ instituteId: customInstituteId });
        if (!institute) {
          throw new Error('Invalid instituteId. Institute not found.');
        }
        const internalInstituteId = institute._id;  // ObjectId

        // Find batch by custom batchId (string) and ensure it belongs to this institute
        const batch = await batchesCollection.findOne({ 
          batchId,
          instituteId: internalInstituteId 
        }, { session });
        if (!batch) {
          throw new Error('Invalid batchId or batch does not belong to the specified institute.');
        }
        if (batch.course !== course) {
          throw new Error('Course does not match the batch course.');
        }
        if (batch.status !== 'active') {
          throw new Error('Batch is not active for registration.');
        }
        if (batch.currentEnrollment >= batch.capacity) {
          throw new Error('Batch is full.');
        }

        // Check if student email already exists for this institute
        const existingStudent = await studentsCollection.findOne({
          email,
          instituteId: internalInstituteId
        }, { session });

        if (existingStudent) {
          throw new Error('Student with this email already exists in this institute');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate custom studentId: YYMM + 4-digit sequence per institute
        const now = new Date();
        const yy = String(now.getFullYear()).slice(2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const prefix = `${yy}${mm}`;
        const monthlyCount = await studentsCollection.countDocuments({
          instituteId: internalInstituteId,
          studentId: { $regex: `^${prefix}` }
        }, { session });
        const seq = String(monthlyCount + 1).padStart(4, '0');
        const customStudentId = `${prefix}${seq}`;

        // Create student
        const student = {
          instituteId: internalInstituteId,
          studentId: customStudentId,
          name,
          email,
          phone,
          dateOfBirth: new Date(dateOfBirth),
          address,
          course,
          batchId,  // String
          password: hashedPassword,
          enrollmentDate: new Date(),
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await studentsCollection.insertOne(student, { session });

        // Increment batch enrollment
        await batchesCollection.updateOne({ batchId }, { $inc: { currentEnrollment: 1 } }, { session });

        // Add student to institute's student list
        await institutesCollection.updateOne(
          { _id: internalInstituteId },
          {
            $push: { students: result.insertedId },
            $set: { updatedAt: new Date() }
          },
          { session }
        );

        // Generate JWT token
        const token = generateToken({
          studentId: result.insertedId.toString(),
          instituteId: internalInstituteId.toString(),
          email: student.email,
          name: student.name,
          role: 'student'
        });

        res.status(201).json({
          message: 'Student registered successfully',
          token,
          studentId: customStudentId,
          student: {
            id: customStudentId,
            name,
            email,
            phone,
            course,
            batchId,
            enrollmentDate: student.enrollmentDate
          }
        });
      });
    } catch (error) {
      console.error('Student register error:', error);
      if (error.message) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to register student' });
    } finally {
      await session.endSession();
    }
  });

  // Get all students for an institute (protected - institute only)
  router.get('/', authenticate, requireInstitute, async (req, res) => {
    try {
      const instituteId = req.user.instituteId;
      const { course, batchId, status, page = 1, limit = 10 } = req.query;

      const query = { instituteId: new ObjectId(instituteId) };

      if (course) query.course = course;
      if (batchId) query.batchId = batchId;
      if (status) query.status = status;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const students = await studentsCollection
        .find(query, { projection: { password: 0 } })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .toArray();

      const total = await studentsCollection.countDocuments(query);

      res.status(200).json({
        students,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get students error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch students' });
    }
  });

  // Get single student (protected - institute only)
  router.get('/:id', authenticate, requireInstitute, async (req, res) => {
    try {
      const instituteId = req.user.instituteId;
      const studentId = req.params.id;

      const student = await studentsCollection.findOne(
        {
          _id: new ObjectId(studentId),
          instituteId: new ObjectId(instituteId)
        },
        { projection: { password: 0 } }
      );

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.status(200).json({ student });
    } catch (error) {
      console.error('Get student error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch student' });
    }
  });

  // Student: get own profile
  router.get('/me', authenticate, requireStudent, async (req, res) => {
    try {
      const sid = new ObjectId(req.user.studentId);
      const instituteId = new ObjectId(req.user.instituteId);
      const student = await studentsCollection.findOne(
        { _id: sid, instituteId },
        { projection: { password: 0 } }
      );
      if (!student) return res.status(404).json({ error: 'Student not found' });
      res.status(200).json({ student });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch profile' });
    }
  });

  // Student: get own profile by custom studentId (security-checked)
  router.get('/by-student-id/:sid', authenticate, requireStudent, async (req, res) => {
    try {
      const instituteId = new ObjectId(req.user.instituteId);
      const sidInternal = new ObjectId(req.user.studentId);
      const sidCustom = req.params.sid;
      const student = await studentsCollection.findOne(
        { studentId: sidCustom, instituteId },
        { projection: { password: 0 } }
      );
      if (!student) return res.status(404).json({ error: 'Student not found' });
      if (!student._id.equals(sidInternal)) return res.status(403).json({ error: 'Access denied' });
      res.status(200).json({ student });
    } catch (error) {
      console.error('Get by studentId error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch profile' });
    }
  });

  // Update student (protected - institute only)
  router.put('/:id', authenticate, requireInstitute, async (req, res) => {
    try {
      const { error } = updateStudentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const instituteId = req.user.instituteId;
      const studentId = req.params.id;

      const updateData = { ...req.body, updatedAt: new Date() };

      if (updateData.dateOfBirth) {
        updateData.dateOfBirth = new Date(updateData.dateOfBirth);
      }

      // If changing batchId, validate new one
      if (updateData.batchId) {
        const batch = await batchesCollection.findOne({
          batchId: updateData.batchId,
          instituteId: new ObjectId(instituteId)
        });
        if (!batch) {
          return res.status(400).json({ error: 'Invalid new batchId' });
        }
        if (batch.course !== req.body.course) {
          return res.status(400).json({ error: 'New batch course mismatch' });
        }
      }

      const result = await studentsCollection.updateOne(
        {
          _id: new ObjectId(studentId),
          instituteId: new ObjectId(instituteId)
        },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.status(200).json({ message: 'Student updated successfully' });
    } catch (error) {
      console.error('Update student error:', error);
      res.status(500).json({ error: error.message || 'Failed to update student' });
    }
  });

  // Delete student (protected - institute only)
  router.delete('/:id', authenticate, requireInstitute, async (req, res) => {
    try {
      const instituteId = req.user.instituteId;
      const studentId = req.params.id;

      // Get student to decrement batch enrollment if needed
      const student = await studentsCollection.findOne({ _id: new ObjectId(studentId), instituteId: new ObjectId(instituteId) });
      if (student && student.batchId) {
        await batchesCollection.updateOne({ batchId: student.batchId }, { $inc: { currentEnrollment: -1 } });
      }

      const result = await studentsCollection.deleteOne({
        _id: new ObjectId(studentId),
        instituteId: new ObjectId(instituteId)
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Remove student from institute's student list
      await institutesCollection.updateOne(
        { _id: new ObjectId(instituteId) },
        {
          $pull: { students: new ObjectId(studentId) },
          $set: { updatedAt: new Date() }
        }
      );

      res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
      console.error('Delete student error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete student' });
    }
  });

  // Student signin
  router.post('/auth/signin', async (req, res) => {
    try {
      const { error } = studentSigninSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { email, password } = req.body;

      // Find student
      const student = await studentsCollection.findOne({ email });
      if (!student) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, student.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (student.status !== 'active') {
        return res.status(403).json({ error: 'Account is not active' });
      }

      // Generate JWT token
      const token = generateToken({
        studentId: student._id.toString(),
        instituteId: student.instituteId.toString(),
        email: student.email,
        name: student.name,
        role: 'student'
      });

      res.status(200).json({
        message: 'Login successful',
        token,
        studentId: student._id.toString(),
        student: {
          id: student._id.toString(),
          name: student.name,
          email: student.email,
          course: student.course,
          batchId: student.batchId,
          enrollmentDate: student.enrollmentDate
        }
      });
    } catch (error) {
      console.error('Student signin error:', error);
      res.status(500).json({ error: error.message || 'Login failed' });
    }
  });

  // Student signin using instituteId + studentId
  router.post('/auth/signin-id', async (req, res) => {
    try {
      const { error } = studentSigninByIdSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { instituteId: customInstituteId, studentId, password } = req.body;

      const { ObjectId } = require('mongodb');
      const institutesCollection = db.collection('institutes');

      const institute = await institutesCollection.findOne({ instituteId: customInstituteId });
      if (!institute) {
        return res.status(404).json({ error: 'Invalid instituteId' });
      }

      const internalInstituteId = institute._id;

      const student = await studentsCollection.findOne({ studentId, instituteId: internalInstituteId });
      if (!student) {
        return res.status(401).json({ error: 'Invalid studentId or instituteId' });
      }

      const isValidPassword = await bcrypt.compare(password, student.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      if (student.status !== 'active') {
        return res.status(403).json({ error: 'Account is not active' });
      }

      const token = generateToken({
        studentId: student._id.toString(),
        instituteId: internalInstituteId.toString(),
        email: student.email,
        name: student.name,
        role: 'student'
      });

      res.status(200).json({
        message: 'Login successful',
        token,
        studentId: student.studentId,
        instituteId: customInstituteId,
        student: {
          id: student.studentId,
          name: student.name,
          email: student.email,
          course: student.course,
          batchId: student.batchId,
          enrollmentDate: student.enrollmentDate
        }
      });
    } catch (error) {
      console.error('Student signin by id error:', error);
      res.status(500).json({ error: error.message || 'Login failed' });
    }
  });

  return router;
};