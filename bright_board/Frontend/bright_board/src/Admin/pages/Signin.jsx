import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Joi from 'joi';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

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
  const API_BASE_URL = 'http://localhost:3000';

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
      localStorage.setItem('token', data.token);
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

  // Animation variants removed in favor of Tailwind and route transitions

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="font-comic text-2xl mb-2">
          {loginSuccess ? 'Login Successful' : 'Institute Login'}
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

            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="text-bw-75 hover:text-white text-sm">Forgot Password?</Link>
              <Link to="/a/signup" className="text-bw-75 hover:text-white text-sm">Register</Link>
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

export default SigninPage;