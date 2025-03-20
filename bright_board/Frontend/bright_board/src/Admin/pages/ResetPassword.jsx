import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Joi from 'joi';
import { Lock, AlertCircle } from 'lucide-react';
import './Signin.css';

// Validation schema
const schema = Joi.object({
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'string.empty': 'Password is required'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'string.empty': 'Confirm password is required'
  })
});

const ResetPasswordPage = () => {
  // State
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [email, setEmail] = useState('');
  
  const navigate = useNavigate();

  // API endpoint
  const API_BASE_URL = 'https://bb-t5a0.onrender.com';

  // Get token and email from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('resetToken');
    const storedEmail = localStorage.getItem('resetEmail');
    
    if (!token || !storedEmail) {
      // Redirect to forgot password page if token or email is missing
      navigate('/forgot-password');
      return;
    }
    
    setResetToken(token);
    setEmail(storedEmail);
  }, [navigate]);

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
    
    // Special handling for confirmPassword to check against password
    if (name === 'confirmPassword') {
      if (value !== formData.password) {
        setErrors(prev => ({ ...prev, [name]: 'Passwords do not match' }));
      } else {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    } else {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
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
    
    setStatusMessage('Resetting password...');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/institutes/reset-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resetToken}`
        },
        body: JSON.stringify({
          email,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
      
      // Handle successful password reset
      setIsSuccess(true);
      setStatusMessage('Password reset successful! Redirecting to login...');
      
      // Clear reset token and email from localStorage
      localStorage.removeItem('resetToken');
      localStorage.removeItem('resetEmail');
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
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
          {isSuccess ? 'Password Reset Successful' : 'Reset Password'}
        </motion.h1>
        
        {statusMessage && (
          <motion.div 
            className={`status-message ${isSuccess ? 'success' : ''}`}
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

        {!isSuccess && (
          <form onSubmit={handleSubmit}>
            <motion.div 
              className="input-group"
              variants={itemVariants}
            >
              <Lock className="input-icon" size={20} />
              <input 
                type="password"
                name="password"
                placeholder="New Password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </motion.div>
            
            <motion.div 
              className="input-group"
              variants={itemVariants}
            >
              <Lock className="input-icon" size={20} />
              <input 
                type="password"
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </motion.div>
            
            <motion.button 
              type="submit"
              className="submit-button"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;