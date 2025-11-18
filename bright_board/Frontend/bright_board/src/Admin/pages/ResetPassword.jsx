import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import Joi from 'joi';
import { Lock, AlertCircle } from 'lucide-react';

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
  

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="font-comic text-2xl mb-2">{isSuccess ? 'Password Reset Successful' : 'Reset Password'}</h1>
        {statusMessage && (
          <div className={`border rounded p-3 mb-3 ${isSuccess ? 'border-bw-75' : 'border-bw-37'}`}>{statusMessage}</div>
        )}
        {errors.general && (
          <div className="border border-bw-37 rounded p-3 mb-3 flex items-center gap-2"><AlertCircle size={18} /><span>{errors.general}</span></div>
        )}
        {!isSuccess && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-bw-75 mb-1">New Password</label>
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-bw-62" />
                <input type="password" name="password" placeholder="New Password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none focus:border-bw-75" />
              </div>
              {errors.password && <div className="text-bw-62 text-sm mt-1">{errors.password}</div>}
            </div>
            <div>
              <label className="block text-sm text-bw-75 mb-1">Confirm New Password</label>
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-bw-62" />
                <input type="password" name="confirmPassword" placeholder="Confirm New Password" value={formData.confirmPassword} onChange={handleChange} className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none focus:border-bw-75" />
              </div>
              {errors.confirmPassword && <div className="text-bw-62 text-sm mt-1">{errors.confirmPassword}</div>}
            </div>
            <Button type="submit" fullWidth disabled={isLoading}>{isLoading ? 'Resetting...' : 'Reset Password'}</Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ResetPasswordPage;