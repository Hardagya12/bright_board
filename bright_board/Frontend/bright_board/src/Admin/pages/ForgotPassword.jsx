import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Joi from 'joi';
import { Mail, Key, ArrowLeft } from 'lucide-react';
import './Signin.css';

// Validation schemas
const emailSchema = Joi.string().email({ tlds: false }).required().messages({
  'string.email': 'Please enter a valid email address',
  'string.empty': 'Email is required'
});

const otpSchema = Joi.string().length(6).pattern(/^\d+$/).required().messages({
  'string.length': 'OTP must be 6 digits',
  'string.pattern.base': 'OTP must contain only numbers',
  'string.empty': 'OTP is required'
});

const ForgotPasswordPage = () => {
  // State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationToken, setVerificationToken] = useState('');
  
  const navigate = useNavigate();

  // API endpoint
  const API_BASE_URL = 'https://bb-t5a0.onrender.com';

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Email field change handler
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    const { error } = emailSchema.validate(value);
    setEmailError(error ? error.message : '');
  };

  // OTP field change handler
  const handleOtpChange = (e) => {
    const value = e.target.value;
    setOtp(value);
    const { error } = otpSchema.validate(value);
    setOtpError(error ? error.message : '');
  };

  // Request OTP handler
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    
    const { error } = emailSchema.validate(email);
    if (error) {
      setEmailError(error.message);
      return;
    }
    
    setStatusMessage('Sending OTP...');
    setIsSending(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/institutes/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }
      
      setIsOtpSent(true);
      setStatusMessage('OTP sent to your email. Please check your inbox.');
      setCountdown(60);
    } catch (err) {
      setEmailError(err.message);
      setStatusMessage('');
    } finally {
      setIsSending(false);
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    const { error } = otpSchema.validate(otp);
    if (error) {
      setOtpError(error.message);
      return;
    }
    
    setStatusMessage('Verifying OTP...');
    setIsVerifying(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/institutes/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }
      
      setIsOtpVerified(true);
      setVerificationToken(data.resetToken);
      setStatusMessage('Email verified! Redirecting to reset password page...');
      
      // Store token and email in localStorage for the reset password page
      localStorage.setItem('resetToken', data.resetToken);
      localStorage.setItem('resetEmail', email);
      
      // Redirect to reset password page after a short delay
      setTimeout(() => {
        navigate('/reset-password');
      }, 1500);
    } catch (err) {
      setOtpError(err.message);
      setStatusMessage('');
    } finally {
      setIsVerifying(false);
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
        <motion.div 
          className="back-link"
          variants={itemVariants}
        >
          <Link to="/" className="back-button">
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </Link>
        </motion.div>
        
        <motion.h1 
          className="form-title"
          variants={itemVariants}
        >
          {isOtpVerified 
            ? 'Verification Successful' 
            : (isOtpSent ? 'Verify OTP' : 'Forgot Password')}
        </motion.h1>
        
        {statusMessage && (
          <motion.div 
            className={`status-message ${isOtpVerified ? 'success' : ''}`}
            variants={itemVariants}
          >
            {statusMessage}
          </motion.div>
        )}

        {/* Email Input Form */}
        {!isOtpSent && !isOtpVerified && (
          <form onSubmit={handleRequestOtp}>
            <motion.div 
              className="input-group"
              variants={itemVariants}
            >
              <Mail className="input-icon" size={20} />
              <input 
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={handleEmailChange}
              />
              {emailError && <div className="error-message">{emailError}</div>}
            </motion.div>
            
            <motion.button 
              type="submit"
              className="submit-button"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSending}
            >
              {isSending ? 'Sending...' : 'Request OTP'}
            </motion.button>
          </form>
        )}

        {/* OTP Verification Form */}
        {isOtpSent && !isOtpVerified && (
          <form onSubmit={handleVerifyOtp}>
            <motion.div 
              className="input-group"
              variants={itemVariants}
            >
              <Key className="input-icon" size={20} />
              <input 
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={handleOtpChange}
                maxLength={6}
              />
              {otpError && <div className="error-message">{otpError}</div>}
            </motion.div>
            
            <motion.button 
              type="submit"
              className="submit-button"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify OTP'}
            </motion.button>
            
            <div className="mt-4 text-center">
              {countdown > 0 ? (
                <p className="text-gray-400 text-sm">
                  Resend code in {countdown} seconds
                </p>
              ) : (
                <button 
                  onClick={handleRequestOtp}
                  disabled={isSending}
                  className="text-indigo-400 text-sm hover:underline"
                  type="button"
                >
                  Resend verification code
                </button>
              )}
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;