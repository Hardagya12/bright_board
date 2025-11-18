import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import Joi from 'joi';
import { Building2, MapPin, Phone, Mail, Lock, BookOpen, Key } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// Validation schemas
const schema = Joi.object({
  instituteName: Joi.string().min(3).max(50).required().messages({
    'string.min': 'Institute name must be at least 3 characters',
    'string.max': 'Institute name cannot exceed 50 characters',
    'string.empty': 'Institute name is required'
  }),
  address: Joi.string().min(5).max(200).required().messages({
    'string.min': 'Address must be at least 5 characters',
    'string.max': 'Address cannot exceed 200 characters',
    'string.empty': 'Address is required'
  }),
  contactNumber: Joi.string().pattern(/^\d{10}$/).required().messages({
    'string.pattern.base': 'Contact number must be 10 digits',
    'string.empty': 'Contact number is required'
  }),
  email: Joi.string().email({ tlds: false }).required().messages({
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'string.empty': 'Password is required'
  }),
  courses: Joi.string().min(1).required().messages({
    'string.min': 'Please enter at least one course',
    'string.empty': 'Courses are required'
  })
});

const otpSchema = Joi.string().length(6).pattern(/^\d+$/).required().messages({
  'string.length': 'OTP must be 6 digits',
  'string.pattern.base': 'OTP must contain only numbers',
  'string.empty': 'OTP is required'
});

const SignupPage = () => {
  // State
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
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [registrationInProgress, setRegistrationInProgress] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  
  const navigate = useNavigate(); // Added for navigation

  // API endpoint
  const API_BASE_URL = 'http://localhost:3000';

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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
    
    // Validate email before requesting OTP
    const { error } = Joi.object({
      email: schema.extract('email')
    }).validate({ email: formData.email });
    
    if (error) {
      setErrors(prev => ({ ...prev, email: error.details[0].message }));
      return;
    }
    
    setStatusMessage('Sending OTP...');
    setIsSending(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/institutes/request-otp`, {
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
    
    const { error } = otpSchema.validate(otp);
    if (error) {
      setOtpError(error.message);
      return;
    }
    
    setStatusMessage('Verifying OTP...');
    setIsVerifying(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/institutes/verify-otp`, {
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
    
    if (!isEmailVerified) {
      setStatusMessage('Please verify your email with OTP first');
      return;
    }
    
    setStatusMessage('Registering your institute...');
    setRegistrationInProgress(true);
    
    try {
      // Map frontend field names to backend expected format
      const response = await fetch(`${API_BASE_URL}/institutes/signup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${verificationToken}` // Include verification token
        },
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
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      setIsRegistered(true);
      setStatusMessage(`Registration successful! Redirecting to dashboard...`);
      
      // Redirect to /a/dashboard after a short delay
      setTimeout(() => {
        navigate('/a/dashboard');
      }, 1500); // 1.5-second delay to show success message
    } catch (err) {
      setStatusMessage(err.message);
    } finally {
      setRegistrationInProgress(false);
    }
  };

  // Animation variants removed in favor of Tailwind and route transitions

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <Card className="w-full max-w-lg p-6">
        <h1 className="font-comic text-2xl mb-2">
          {isRegistered
            ? 'Registration Complete'
            : (isEmailVerified
                ? 'Complete Registration'
                : (isOtpSent
                    ? 'Verify Email'
                    : 'Institute Registration'))}
        </h1>
        
        {statusMessage && (
          <div className="border border-bw-37 rounded p-3 mb-4 text-bw-62">
            {statusMessage}
          </div>
        )}

        {/* Email Input Form */}
        {!isOtpSent && !isEmailVerified && !isRegistered && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-sm text-bw-75 mb-1">Email</label>
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-bw-62" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white placeholder:text-bw-62 focus:outline-none focus:border-bw-75"
                />
              </div>
              {errors.email && <div className="text-bw-62 text-sm mt-1">{errors.email}</div>}
            </div>

            <Button type="submit" fullWidth disabled={isSending}>
              {isSending ? 'Sending...' : 'Request OTP'}
            </Button>

            <div className="text-right">
              <Link to="/a/signin" className="text-bw-75 hover:text-white text-sm">Already registered? Sign In</Link>
            </div>
          </form>
        )}

        {/* OTP Verification Form */}
        {isOtpSent && !isEmailVerified && !isRegistered && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm text-bw-75 mb-1">OTP</label>
              <div className="flex items-center gap-2">
                <Key size={18} className="text-bw-62" />
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength={6}
                  className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white placeholder:text-bw-62 focus:outline-none focus:border-bw-75"
                />
              </div>
              {otpError && <div className="text-bw-62 text-sm mt-1">{otpError}</div>}
            </div>

            <Button type="submit" fullWidth disabled={isVerifying}>
              {isVerifying ? 'Verifying...' : 'Verify OTP'}
            </Button>

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-bw-62 text-sm">Resend code in {countdown} seconds</p>
              ) : (
                <button onClick={handleRequestOtp} disabled={isSending} className="text-bw-75 text-sm hover:text-white" type="button">
                  Resend verification code
                </button>
              )}
            </div>
          </form>
        )}

        {/* Registration Form */}
        {isEmailVerified && !isRegistered && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-bw-75 mb-1">Institute Name</label>
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-bw-62" />
                <input
                  type="text"
                  name="instituteName"
                  placeholder="Institute Name"
                  value={formData.instituteName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white placeholder:text-bw-62 focus:outline-none focus:border-bw-75"
                />
              </div>
              {errors.instituteName && <div className="text-bw-62 text-sm mt-1">{errors.instituteName}</div>}
            </div>

            <div>
              <label className="block text-sm text-bw-75 mb-1">Address</label>
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-bw-62" />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white placeholder:text-bw-62 focus:outline-none focus:border-bw-75"
                />
              </div>
              {errors.address && <div className="text-bw-62 text-sm mt-1">{errors.address}</div>}
            </div>

            <div>
              <label className="block text-sm text-bw-75 mb-1">Contact Number</label>
              <div className="flex items-center gap-2">
                <Phone size={18} className="text-bw-62" />
                <input
                  type="text"
                  name="contactNumber"
                  placeholder="Contact Number"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white placeholder:text-bw-62 focus:outline-none focus:border-bw-75"
                />
              </div>
              {errors.contactNumber && <div className="text-bw-62 text-sm mt-1">{errors.contactNumber}</div>}
            </div>

            <div>
              <label className="block text-sm text-bw-75 mb-1">Email</label>
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-bw-62" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  readOnly
                  className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white"
                />
                <span className="text-bw-75 text-sm">✓ Verified</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-bw-75 mb-1">Password</label>
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-bw-62" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white placeholder:text-bw-62 focus:outline-none focus:border-bw-75"
                />
              </div>
              {errors.password && <div className="text-bw-62 text-sm mt-1">{errors.password}</div>}
            </div>

            <div>
              <label className="block text-sm text-bw-75 mb-1">Courses</label>
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-bw-62" />
                <input
                  type="text"
                  name="courses"
                  placeholder="Courses (comma separated)"
                  value={formData.courses}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white placeholder:text-bw-62 focus:outline-none focus:border-bw-75"
                />
              </div>
              {errors.courses && <div className="text-bw-62 text-sm mt-1">{errors.courses}</div>}
            </div>

            <Button type="submit" fullWidth disabled={registrationInProgress}>
              {registrationInProgress ? 'Registering...' : 'Complete Registration'}
            </Button>
          </form>
        )}

        {/* Registration Success */}
        {isRegistered && (
          <div>
            <p className="text-bw-75">Registration successful! Redirecting to dashboard...</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SignupPage;