import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, AlertTriangle, ShieldCheck, User, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import { BookSVG, PencilSVG, StarSVG, BackpackSVG, SparklesSVG, LightbulbSVG } from '../../components/svg/SchoolIllustrations';

const SigninStudent = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:3000';

  const validateField = (name, value) => {
    switch (name) {
      case 'email': return !/\S+@\S+\.\S+/.test(value) ? 'Invalid email format' : null;
      case 'password': return !value ? 'Password is required' : null;
      default: return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) { newErrors[key] = error; isValid = false; }
    });
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setStatusMessage('Authenticating...');
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/students/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Access Denied');
      setLoginSuccess(true);
      setStatusMessage('Welcome back! Redirecting...');
      localStorage.setItem('token', data.token);
      localStorage.setItem('studentToken', data.token);
      localStorage.removeItem('authToken');
      localStorage.setItem('studentName', data.student?.name || '');
      localStorage.setItem('instituteId', data.student?.instituteId || '');
      localStorage.setItem('studentId', data.studentId);
      setTimeout(() => { navigate('/s/dashboard'); }, 1500);
    } catch (err) {
      setStatusMessage('');
      setErrors(prev => ({ ...prev, general: err.message }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9faf6] flex items-center justify-center px-4 relative overflow-hidden font-body">
      
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, #0e0f0c 0px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #0e0f0c 0px, transparent 1px, transparent 60px)',
      }} />

      {/* Floating Illustrations */}
      <div className="absolute top-[10%] left-[5%] opacity-25 pointer-events-none"><BookSVG size={80} /></div>
      <div className="absolute bottom-[10%] right-[5%] opacity-20 pointer-events-none"><BackpackSVG size={70} /></div>
      <div className="absolute top-[20%] right-[8%] opacity-15 pointer-events-none"><PencilSVG size={60} /></div>
      <div className="absolute bottom-[20%] left-[8%] opacity-15 pointer-events-none"><StarSVG size={50} /></div>
      <div className="absolute top-[5%] right-[40%] opacity-20 pointer-events-none"><SparklesSVG size={30} /></div>
      <div className="absolute bottom-[5%] left-[35%] opacity-15 pointer-events-none"><LightbulbSVG size={50} /></div>

      {/* Green blob */}
      <div className="absolute top-[10%] right-[15%] w-[300px] h-[300px] bg-[#9fe870]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[250px] h-[250px] bg-[#ffd11a]/8 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bb-card p-10 md:p-12 relative overflow-hidden">
          {/* Green accent */}
          <div className="absolute top-0 left-[10%] right-[10%] h-[3px] rounded-b-full bg-[#9fe870]" />
          
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-20 h-20 rounded-full bg-[#e2f6d5] border-2 border-[#9fe870]/30 flex items-center justify-center text-[#163300] mb-6 relative">
              {loginSuccess ? <ShieldCheck size={36} /> : <Lock size={36} />}
            </div>
            <h1 className="text-3xl font-display text-[#0e0f0c] mb-2">
              {loginSuccess ? 'Welcome Back!' : 'Student Portal'}
            </h1>
            <p className="text-[#868685] text-sm font-medium">
              {loginSuccess ? 'Your dashboard is loading.' : 'Enter your credentials to continue.'}
            </p>
          </div>

          {statusMessage && (
            <div className={`p-4 mb-6 rounded-full text-sm font-bold flex items-center justify-center gap-3 ${loginSuccess ? 'bg-[#e2f6d5] text-[#054d28] border border-[#054d28]/15' : 'bg-[#e8f4ff] text-[#0066cc] border border-[#0066cc]/15'}`}>
              {loginSuccess && <ShieldCheck size={18} />}
              {statusMessage}
            </div>
          )}

          {errors.general && (
            <div className="flex items-start gap-3 rounded-[16px] p-4 mb-6 bg-[#ffeaea] text-[#d03238] border border-[#d03238]/15">
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              <span className="text-sm font-medium leading-relaxed">{errors.general}</span>
            </div>
          )}

          {!loginSuccess && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#868685] uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-[#868685]">
                    <User size={18} />
                  </div>
                  <input
                    type="email" name="email" placeholder="student@example.com"
                    value={formData.email} onChange={handleChange}
                    className="input-wise pl-12"
                    spellCheck="false"
                  />
                </div>
                {errors.email && <div className="text-[#d03238] text-xs mt-1 ml-2 font-medium">{errors.email}</div>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1 mb-1">
                  <label className="text-xs font-bold text-[#868685] uppercase tracking-widest">Password</label>
                  <Link to="/forgot-password" className="text-[#163300] hover:text-[#9fe870] text-xs font-bold transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-[#868685]">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password" name="password" placeholder="••••••••"
                    value={formData.password} onChange={handleChange}
                    className="input-wise pl-12"
                  />
                </div>
                {errors.password && <div className="text-[#d03238] text-xs mt-1 ml-2 font-medium">{errors.password}</div>}
              </div>

              <div className="pt-3">
                <Button 
                  type="submit" disabled={isLoading}
                  className="w-full py-4 text-sm"
                  variant="primary"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'} {!isLoading && <ArrowRight size={16} />}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SigninStudent;