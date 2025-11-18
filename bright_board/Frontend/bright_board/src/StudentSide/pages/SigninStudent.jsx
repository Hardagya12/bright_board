import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const SigninStudent = () => {
  // State
  const [formData, setFormData] = useState({
    instituteId: '',
    studentId: '',
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
      case 'instituteId':
        return !value ? 'Institute ID is required' : null;
      case 'studentId':
        return !value ? 'Student ID is required' : null;
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
      const response = await fetch(`${API_BASE_URL}/students/auth/signin-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instituteId: formData.instituteId,
          studentId: formData.studentId,
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
      localStorage.setItem('studentName', data.student?.name || '');
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
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="font-comic text-2xl mb-2">
          {loginSuccess ? 'Login Successful' : 'Student Login'}
        </h1>

        {statusMessage && (
          <div className={`border rounded p-3 mb-4 ${loginSuccess ? 'border-bw-75 text-bw-75' : 'border-bw-37 text-bw-62'}`}>
            {statusMessage}
          </div>
        )}

        {errors.general && (
          <div className="flex items-center gap-2 border border-bw-37 rounded p-3 mb-4 text-bw-62">
            <AlertCircle size={18} />
            <span>{errors.general}</span>
          </div>
        )}

        {!loginSuccess && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-bw-75 mb-1">Institute ID</label>
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-bw-62" />
                <input
                  type="text"
                  name="instituteId"
                  placeholder="INST0001"
                  value={formData.instituteId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white placeholder:text-bw-62 focus:outline-none focus:border-bw-75"
                />
              </div>
              {errors.instituteId && <div className="text-bw-62 text-sm mt-1">{errors.instituteId}</div>}
            </div>

            <div>
              <label className="block text-sm text-bw-75 mb-1">Student ID</label>
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-bw-62" />
                <input
                  type="text"
                  name="studentId"
                  placeholder="60d21b4667d0d8992e610c85"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white placeholder:text-bw-62 focus:outline-none focus:border-bw-75"
                />
              </div>
              {errors.studentId && <div className="text-bw-62 text-sm mt-1">{errors.studentId}</div>}
            </div>

            <div>
              <label className="block text-sm text-bw-75 mb-1">Password</label>
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-bw-62" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white placeholder:text-bw-62 focus:outline-none focus:border-bw-75"
                />
              </div>
              {errors.password && <div className="text-bw-62 text-sm mt-1">{errors.password}</div>}
            </div>

            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="text-bw-75 hover:text-white text-sm">Forgot Password?</Link>
              <Link to="/s/signup" className="text-bw-75 hover:text-white text-sm">Register</Link>
            </div>

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default SigninStudent;