import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Joi from 'joi';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import './Signin.css';

// Validation schema
const schema = Joi.object({
  email: Joi.string().email({ tlds: false }).required().messages({
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required'
  })
});

const SigninPage = () => {
  // State
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // API endpoint
  const API_BASE_URL = 'https://bb-t5a0.onrender.com';

  // Validate individual field
  const validateField = (name, value) => {
    const fieldSchema = schema.extract(name);
    const { error } = fieldSchema.validate(value);
    return error ? error.message : null;
  };

  // Form field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all form fields
    const { error } = schema.validate(formData, { abortEarly: false });
    
    if (error) {
      const validationErrors = {};
      error.details.forEach(detail => {
        validationErrors[detail.path[0]] = detail.message;
      });
      setErrors(validationErrors);
      return;
    }
    
    setStatusMessage('Signing in...');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/institutes/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }
      
      // Handle successful login
      setLoginSuccess(true);
      setStatusMessage('Login successful! Redirecting to dashboard...');
      
      // Store auth token in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('instituteId', data.instituteId);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/a/dashboard';
      }, 1500);
      
    } catch (err) {
      setStatusMessage('');
      setErrors(prev => ({ ...prev, general: err.message }));
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="signin-container">
      <motion.div 
        className="form-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="form-title"
          variants={itemVariants}
        >
          {loginSuccess ? 'Login Successful' : 'Institute Login'}
        </motion.h1>
        
        {statusMessage && (
          <motion.div 
            className={`status-message ${loginSuccess ? 'success' : ''}`}
            variants={itemVariants}
          >
            {statusMessage}
          </motion.div>
        )}

        {errors.general && (
          <motion.div 
            className="error-banner"
            variants={itemVariants}
          >
            <AlertCircle size={18} />
            <span>{errors.general}</span>
          </motion.div>
        )}

        {!loginSuccess && (
          <form onSubmit={handleSubmit}>
            <motion.div 
              className="input-group"
              variants={itemVariants}
            >
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
            
            <motion.div 
              className="input-group"
              variants={itemVariants}
            >
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
            
            <motion.div 
              className="forgot-password"
              variants={itemVariants}
            >
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </motion.div>
            
            <motion.button 
              type="submit"
              className="submit-button"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </motion.button>
            
            <motion.div 
              className="signup-link-container"
              variants={itemVariants}
            >
              <Link to="/a/signup" className="signup-link">
                Don't have an account? Register
              </Link>
            </motion.div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default SigninPage;