import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, Lock, Key, User } from 'lucide-react';
import './StudentSignup.css';

const StudentSignup = () => {
  // State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    instituteId: '',
    contactNumber: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [registrationInProgress, setRegistrationInProgress] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [instituteInfo, setInstituteInfo] = useState(null);
  const [isCheckingInstitute, setIsCheckingInstitute] = useState(false);
  
  const navigate = useNavigate();

  // API endpoint
  const API_BASE_URL = 'http://localhost:3000';

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Validate form fields
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.length < 3 ? 'Name must be at least 3 characters' : null;
      case 'email':
        return !/\S+@\S+\.\S+/.test(value) ? 'Please enter a valid email address' : null;
      case 'password':
        return value.length < 6 ? 'Password must be at least 6 characters' : null;
      case 'instituteId':
        return !value ? 'Institute ID is required' : null;
      case 'contactNumber':
        return !/^\d{10}$/.test(value) ? 'Contact number must be 10 digits' : null;
      case 'address':
        return value.length < 5 ? 'Address must be at least 5 characters' : null;
      default:
        return null;
    }
  };

  // Form field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));

    // If instituteId is changed and has a value, verify it
    if (name === 'instituteId' && value.trim() !== '') {
      verifyInstituteId(value);
    } else if (name === 'instituteId') {
      setInstituteInfo(null);
    }
  };

  // Verify institute ID
  const verifyInstituteId = async (id) => {
    setIsCheckingInstitute(true);
    try {
      const response = await fetch(`${API_BASE_URL}/institutes/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setInstituteInfo(data);
        setErrors(prev => ({ ...prev, instituteId: null }));
      } else {
        setInstituteInfo(null);
        setErrors(prev => ({ ...prev, instituteId: 'Invalid Institute ID' }));
      }
    } catch (err) {
      setInstituteInfo(null);
      setErrors(prev => ({ ...prev, instituteId: 'Error verifying Institute ID' }));
    } finally {
      setIsCheckingInstitute(false);
    }
  };

  // OTP field change handler
  const handleOtpChange = (e) => {
    const value = e.target.value;
    setOtp(value);
    setOtpError(!/^\d{6}$/.test(value) && value.length === 6 ? 'OTP must be 6 digits' : '');
  };

  // Request OTP handler
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    
    // Validate email before requesting OTP
    const emailError = validateField('email', formData.email);
    if (emailError) {
      setErrors(prev => ({ ...prev, email: emailError }));
      return;
    }
    
    setStatusMessage('Sending OTP...');
    setIsSending(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/students/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }
      
      setIsOtpSent(true);
      setStatusMessage('OTP sent to your email. Please check your inbox.');
      setCountdown(60);
    } catch (err) {
      setErrors(prev => ({ ...prev, email: err.message }));
      setStatusMessage('');
    } finally {
      setIsSending(false);
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (!/^\d{6}$/.test(otp)) {
      setOtpError('OTP must be 6 digits');
      return;
    }
    
    setStatusMessage('Verifying OTP...');
    setIsVerifying(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/students/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }
      
      setIsEmailVerified(true);
      setVerificationToken(data.verificationToken);
      setStatusMessage('Email verified successfully! Complete your registration.');
    } catch (err) {
      setOtpError(err.message);
      setStatusMessage('');
    } finally {
      setIsVerifying(false);
    }
  };

  // Validate all form fields
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });
    
    // Additional validation for instituteId
    if (!instituteInfo && formData.instituteId) {
      newErrors.instituteId = 'Invalid Institute ID';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!isEmailVerified) {
      setStatusMessage('Please verify your email with OTP first');
      return;
    }
    
    setStatusMessage('Registering your account...');
    setRegistrationInProgress(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/students/signup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${verificationToken}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          instituteId: formData.instituteId,
          contactNumber: formData.contactNumber,
          address: formData.address
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      setIsRegistered(true);
      setStatusMessage(`Registration successful! Redirecting to dashboard...`);
      
      // Store auth token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('studentName', data.name);
      localStorage.setItem('instituteId', data.instituteId);
      
      // Redirect to student dashboard after a short delay
      setTimeout(() => {
        navigate('/s/dashboard');
      }, 1500);
    } catch (err) {
      setStatusMessage(err.message);
    } finally {
      setRegistrationInProgress(false);
    }
  };

  return (
    <div className="student-signup-container">
      <div className="form-container">
        <h1 className="form-title">
          {isRegistered
            ? 'Registration Complete'
            : (isEmailVerified
                ? 'Complete Registration'
                : (isOtpSent
                    ? 'Verify Email'
                    : 'Student Registration'))}
        </h1>
        
        {statusMessage && (
          <div className="status-message">
            {statusMessage}
          </div>
        )}

        {/* Email Input Form */}
        {!isOtpSent && !isEmailVerified && !isRegistered && (
          <form onSubmit={handleRequestOtp}>
            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input 
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            
            <button 
              type="submit"
              className="submit-button"
              disabled={isSending}
            >
              {isSending ? 'Sending...' : 'Request OTP'}
            </button>
            
            <div className="signin-link-container">
              <Link to="/s/signin" className="signin-link">
                Already registered? Sign In
              </Link>
            </div>
          </form>
        )}

        {/* OTP Verification Form */}
        {isOtpSent && !isEmailVerified && !isRegistered && (
          <form onSubmit={handleVerifyOtp}>
            <div className="input-group">
              <Key className="input-icon" size={20} />
              <input 
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={handleOtpChange}
                maxLength={6}
              />
              {otpError && <div className="error-message">{otpError}</div>}
            </div>
            
            <button 
              type="submit"
              className="submit-button"
              disabled={isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify OTP'}
            </button>
            
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

        {/* Registration Form */}
        {isEmailVerified && !isRegistered && (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <User className="input-icon" size={20} />
              <input 
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            
            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input 
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                readOnly 
                className="verified-field"
              />
              <span className="verified-badge">✓ Verified</span>
            </div>
            
            <div className="input-group">
              <Building2 className="input-icon" size={20} />
              <input 
                type="text"
                name="instituteId"
                placeholder="Institute ID (provided by your institute)"
                value={formData.instituteId}
                onChange={handleChange}
              />
              {errors.instituteId && <div className="error-message">{errors.instituteId}</div>}
              {isCheckingInstitute && <div className="info-message">Verifying institute...</div>}
              {instituteInfo && (
                <div className="success-message">
                  Institute verified: {instituteInfo.name}
                </div>
              )}
            </div>
            
            <div className="input-group">
              <Phone className="input-icon" size={20} />
              <input 
                type="text"
                name="contactNumber"
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChange={handleChange}
              />
              {errors.contactNumber && <div className="error-message">{errors.contactNumber}</div>}
            </div>
            
            <div className="input-group">
              <MapPin className="input-icon" size={20} />
              <input 
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
              />
              {errors.address && <div className="error-message">{errors.address}</div>}
            </div>
            
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input 
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
            
            <button 
              type="submit"
              className="submit-button"
              disabled={registrationInProgress || !instituteInfo}
            >
              {registrationInProgress ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {/* Registration Success */}
        {isRegistered && (
          <div>
            <p className="success-message">
              Registration successful! Redirecting to dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSignup;