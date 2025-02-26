import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Joi from 'joi';
import { Building2, MapPin, Phone, Mail, Lock, BookOpen, Key } from 'lucide-react';
import './Signup.css';

const schema = Joi.object({
  instituteName: Joi.string().min(3).max(50).required()
    .messages({
      'string.min': 'Institute name must be at least 3 characters',
      'string.max': 'Institute name cannot exceed 50 characters',
      'string.empty': 'Institute name is required'
    }),
  address: Joi.string().min(5).max(200).required()
    .messages({
      'string.min': 'Address must be at least 5 characters',
      'string.max': 'Address cannot exceed 200 characters',
      'string.empty': 'Address is required'
    }),
  contactNumber: Joi.string().pattern(/^\d{10}$/).required()
    .messages({
      'string.pattern.base': 'Contact number must be 10 digits',
      'string.empty': 'Contact number is required'
    }),
  email: Joi.string().email({ tlds: false }).required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.empty': 'Email is required'
    }),
  password: Joi.string().min(6).required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.empty': 'Password is required'
    }),
  courses: Joi.string().min(1).required()
    .messages({
      'string.min': 'Please enter at least one course',
      'string.empty': 'Courses are required'
    })
});

const otpSchema = Joi.string().length(6).pattern(/^\d+$/).required()
  .messages({
    'string.length': 'OTP must be 6 digits',
    'string.pattern.base': 'OTP must contain only numbers',
    'string.empty': 'OTP is required'
  });

const SignupPage = () => {
  const [formData, setFormData] = useState({
    instituteName: '',
    address: '',
    contactNumber: '',
    email: '',
    password: '',
    courses: ''
  });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [otpError, setOtpError] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const validateField = (name, value) => {
    const fieldSchema = schema.extract(name);
    const { error } = fieldSchema.validate(value);
    return error ? error.message : null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    setOtp(value);
    const { error } = otpSchema.validate(value);
    setOtpError(error ? error.message : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isOtpSent) {
      const { error } = schema.validate(formData, { abortEarly: false });
      
      if (error) {
        const validationErrors = {};
        error.details.forEach(detail => {
          validationErrors[detail.path[0]] = detail.message;
        });
        setErrors(validationErrors);
        return;
      }

      try {
        const response = await fetch('https://bright-board1.onrender.com/institutes/signup/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.instituteName,
            address: formData.address,
            contactNumber: formData.contactNumber,
            email: formData.email,
            password: formData.password,
            coursesOffered: formData.courses.split(',').map(course => course.trim())
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to send OTP');
        
        setIsOtpSent(true);
      } catch (err) {
        setErrors(prev => ({ ...prev, email: err.message }));
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const { error } = otpSchema.validate(otp);
    
    if (error) {
      setOtpError(error.message);
      return;
    }

    try {
      const response = await fetch('https://bright-board1.onrender.com/institutes/signup/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Invalid OTP');

      setIsVerified(true);
    } catch (err) {
      setOtpError(err.message);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="signup-container">
      <motion.div
        className="form-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 className="form-title" variants={itemVariants}>
          {isVerified ? 'Registration Complete' : isOtpSent ? 'Verify OTP' : 'Institute Registration'}
        </motion.h1>

        {!isVerified && !isOtpSent && (
          <form onSubmit={handleSubmit}>
            <motion.div className="input-group" variants={itemVariants}>
              <Building2 className="input-icon" size={20} />
              <input
                type="text"
                name="instituteName"
                placeholder="Institute Name"
                value={formData.instituteName}
                onChange={handleChange}
              />
              {errors.instituteName && <div className="error-message">{errors.instituteName}</div>}
            </motion.div>

            <motion.div className="input-group" variants={itemVariants}>
              <MapPin className="input-icon" size={20} />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
              />
              {errors.address && <div className="error-message">{errors.address}</div>}
            </motion.div>

            <motion.div className="input-group" variants={itemVariants}>
              <Phone className="input-icon" size={20} />
              <input
                type="text"
                name="contactNumber"
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChange={handleChange}
              />
              {errors.contactNumber && <div className="error-message">{errors.contactNumber}</div>}
            </motion.div>

            <motion.div className="input-group" variants={itemVariants}>
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </motion.div>

            <motion.div className="input-group" variants={itemVariants}>
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </motion.div>

            <motion.div className="input-group" variants={itemVariants}>
              <BookOpen className="input-icon" size={20} />
              <input
                type="text"
                name="courses"
                placeholder="Courses (comma separated)"
                value={formData.courses}
                onChange={handleChange}
              />
              {errors.courses && <div className="error-message">{errors.courses}</div>}
            </motion.div>

            <motion.button
              type="submit"
              className="submit-button"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Send OTP
            </motion.button>

            <motion.div className="signin-link-container" variants={itemVariants}>
              <Link to="/signin" className="signin-link">
                Already registered? Sign In
              </Link>
            </motion.div>
          </form>
        )}

        {isOtpSent && !isVerified && (
          <form onSubmit={handleOtpSubmit}>
            <motion.div className="input-group" variants={itemVariants}>
              <Key className="input-icon" size={20} />
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={handleOtpChange}
              />
              {otpError && <div className="error-message">{otpError}</div>}
            </motion.div>

            <motion.button
              type="submit"
              className="submit-button"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Verify OTP
            </motion.button>
          </form>
        )}

        {isVerified && (
          <motion.div variants={itemVariants}>
            <p className="success-message">Registration successful! You can now sign in.</p>
            <Link to="/signin" className="signin-link">
              Go to Sign In
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SignupPage;