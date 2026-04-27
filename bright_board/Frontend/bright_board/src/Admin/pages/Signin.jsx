import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, AlertCircle, ArrowRight, CheckCircle2, GraduationCap } from "lucide-react";
import Joi from "joi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { API_BASE_URL } from "../../config/api";
import { ChalkboardSVG, GradCapSVG, PencilSVG, StarSVG, SparklesSVG, SchoolBellSVG } from "../../components/svg/SchoolIllustrations";

const schema = Joi.object({
  email: Joi.string().email({ tlds: false }).required().messages({
    "string.email": "Please enter a valid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

const InputGroup = ({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-[#868685] uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#868685] group-focus-within:text-[#163300] transition-colors">
        <Icon size={18} />
      </div>
      <input
        className={`input-wise pl-12 ${error ? "!border-[#d03238] focus:!border-[#d03238] focus:!shadow-[0_0_0_3px_rgba(208,50,56,0.15)]" : ""}`}
        {...props}
      />
    </div>
    {error && (
      <p className="text-xs text-[#d03238] font-medium flex items-center gap-1.5 mt-1 ml-1">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

const SigninPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const navigate = useNavigate();

  const validateField = (name, value) => {
    const fieldSchema = schema.extract(name);
    const { error } = fieldSchema.validate(value);
    return error ? error.message : null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = schema.validate(formData, { abortEarly: false });
    if (error) {
      const validationErrors = {};
      error.details.forEach((detail) => { validationErrors[detail.path[0]] = detail.message; });
      setErrors(validationErrors);
      return;
    }
    setStatusMessage("Authenticating...");
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/institutes/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invalid email or password");
      setLoginSuccess(true);
      setStatusMessage("Login successful! Redirecting...");
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("instituteId", data.instituteId);
      setTimeout(() => { navigate("/a/dashboard"); }, 1500);
    } catch (err) {
      setStatusMessage("");
      setErrors((prev) => ({ ...prev, general: err.message }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9faf6] text-[#0e0f0c] flex items-center justify-center p-4 relative overflow-hidden font-body">
      
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, #0e0f0c 0px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #0e0f0c 0px, transparent 1px, transparent 60px)',
      }} />

      {/* Floating Illustrations */}
      <div className="absolute top-[8%] right-[8%] opacity-20 pointer-events-none"><ChalkboardSVG size={110} /></div>
      <div className="absolute bottom-[10%] left-[5%] opacity-20 pointer-events-none"><GradCapSVG size={70} /></div>
      <div className="absolute top-[15%] left-[10%] opacity-15 pointer-events-none"><PencilSVG size={55} /></div>
      <div className="absolute bottom-[15%] right-[10%] opacity-15 pointer-events-none"><StarSVG size={50} /></div>
      <div className="absolute top-[5%] left-[40%] opacity-20 pointer-events-none"><SparklesSVG size={30} /></div>
      <div className="absolute bottom-[5%] right-[35%] opacity-15 pointer-events-none"><SchoolBellSVG size={45} /></div>

      {/* Green blobs */}
      <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-[#9fe870]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[15%] w-[250px] h-[250px] bg-[#ffc091]/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="bb-card w-full max-w-md p-8 md:p-10 relative z-10">
        {/* Green accent */}
        <div className="absolute top-0 left-[10%] right-[10%] h-[3px] rounded-b-full bg-[#9fe870]" />

        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-[#e2f6d5] border-2 border-[#9fe870]/30 flex items-center justify-center mx-auto mb-6 relative">
            <GraduationCap size={36} className="text-[#163300]" />
          </div>
          <h1 className="text-3xl font-display text-[#0e0f0c] mb-2 relative inline-block">
            Welcome Back
            <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
              <path d="M2 5 Q50 1 100 5 Q150 9 198 3" stroke="#9fe870" strokeWidth="4" strokeLinecap="round" fill="none" />
            </svg>
          </h1>
          <p className="text-[#868685] text-sm mt-4 font-medium">
            Sign in to access your admin dashboard
          </p>
        </div>

        <AnimatePresence mode="wait">
          {loginSuccess ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-[#e2f6d5] flex items-center justify-center mx-auto mb-6 text-[#054d28]">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-display text-[#0e0f0c] mb-2">Login Successful!</h3>
              <p className="text-[#868685] font-medium">Redirecting to dashboard...</p>
            </motion.div>
          ) : (
            <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-5">
              {errors.general && (
                <div className="p-4 rounded-[16px] bg-[#ffeaea] border border-[#d03238]/15 text-[#d03238] text-sm flex items-start gap-3">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span className="font-medium">{errors.general}</span>
                </div>
              )}

              <InputGroup label="Institute Email" icon={Mail} type="email" name="email" placeholder="admin@institute.edu" value={formData.email} onChange={handleChange} error={errors.email} />

              <div className="space-y-2">
                <InputGroup label="Password" icon={Lock} type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} error={errors.password} />
                <div className="flex justify-end pt-1">
                  <Link to="/forgot-password" className="text-xs font-bold text-[#163300] hover:text-[#9fe870] transition-colors">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <div className="pt-3">
                <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="py-4 text-base group">
                  {isLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      Access Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </div>

              <div className="text-center text-sm text-[#868685] pt-4 font-medium">
                New institute?{" "}
                <Link to="/a/signup" className="text-[#163300] hover:text-[#9fe870] font-bold transition-colors">
                  Register Here
                </Link>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SigninPage;
