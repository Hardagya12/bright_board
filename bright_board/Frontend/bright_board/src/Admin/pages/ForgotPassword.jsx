import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import Joi from 'joi';
import { Mail, Key, ArrowLeft } from 'lucide-react';

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
  

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-3">
          <Link to="/" className="text-bw-75 text-sm hover:text-white flex items-center gap-2"><ArrowLeft size={16} /> Back to Login</Link>
        </div>
        <h1 className="font-comic text-2xl mb-2">
          {isOtpVerified ? 'Verification Successful' : (isOtpSent ? 'Verify OTP' : 'Forgot Password')}
        </h1>
        {statusMessage && (
          <div className={`border rounded p-3 mb-3 ${isOtpVerified ? 'border-bw-75' : 'border-bw-37'}`}>{statusMessage}</div>
        )}

        {!isOtpSent && !isOtpVerified && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-sm text-bw-75 mb-1">Email</label>
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-bw-62" />
                <input type="email" placeholder="Enter your registered email" value={email} onChange={handleEmailChange} className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none focus:border-bw-75" />
              </div>
              {emailError && <div className="text-bw-62 text-sm mt-1">{emailError}</div>}
            </div>
            <Button type="submit" fullWidth disabled={isSending}>{isSending ? 'Sending...' : 'Request OTP'}</Button>
          </form>
        )}

        {isOtpSent && !isOtpVerified && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm text-bw-75 mb-1">OTP</label>
              <div className="flex items-center gap-2">
                <Key size={18} className="text-bw-62" />
                <input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={handleOtpChange} maxLength={6} className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none focus:border-bw-75" />
              </div>
              {otpError && <div className="text-bw-62 text-sm mt-1">{otpError}</div>}
            </div>
            <Button type="submit" fullWidth disabled={isVerifying}>{isVerifying ? 'Verifying...' : 'Verify OTP'}</Button>
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-bw-62 text-sm">Resend code in {countdown} seconds</p>
              ) : (
                <button onClick={handleRequestOtp} disabled={isSending} className="text-bw-75 text-sm hover:text-white" type="button">Resend verification code</button>
              )}
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;