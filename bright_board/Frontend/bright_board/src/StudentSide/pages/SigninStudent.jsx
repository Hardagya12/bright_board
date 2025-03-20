import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import './SigninStudent.css';

const SigninStudent = () => {
  // State
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  const navigate = useNavigate();

  // API endpoint
  const API_BASE_URL = 'http://localhost:3000';

  // Validate individual field
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return !/\S+@\S+\.\S+/.test(value) ? 'Please enter a valid email address' : null;
      case 'password':
        return !value ? 'Password is required' : null;
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
  };

  // Validate form
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
    
    setErrors(newErrors);
    return isValid;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setStatusMessage('Signing in...');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/students/signin`, {
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
      localStorage.setItem('token', data.token);
      localStorage.setItem('studentName', data.name);
      localStorage.setItem('instituteId', data.instituteId);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/s/dashboard');
      }, 1500);
      
    } catch (err) {
      setStatusMessage('');
      setErrors(prev => ({ ...prev, general: err.message }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="student-signin-container">
      <div className="form-container">
        <h1 className="form-title">
          {loginSuccess ? 'Login Successful' : 'Student Login'}
        </h1>
        
        {statusMessage && (
          <div className={`status-message ${loginSuccess ? 'success' : ''}`}>
            {statusMessage}
          </div>
        )}

        {errors.general && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{errors.general}</span>
          </div>
        )}

        {!loginSuccess && (
          <form onSubmit={handleSubmit}>
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
            
            <div className="forgot-password">
              <Link to="/s/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>
            
            <button 
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
            
            <div className="signup-link-container">
              <Link to="/s/signup" className="signup-link">
                Don't have an account? Register
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SigninStudent;