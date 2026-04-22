import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Joi from "joi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { API_BASE_URL } from "../../config/api";

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
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors">
        <Icon size={18} />
      </div>
      <input
        className={`w-full bg-black/40 border rounded-xl pl-10 pr-4 py-3 text-white outline-none transition-all ${error
            ? "border-red-500/50 focus:ring-2 focus:ring-red-500/20"
            : "border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
          }`}
        {...props}
      />
    </div>
    {error && (
      <p className="text-xs text-red-400 flex items-center gap-1">
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
      error.details.forEach((detail) => {
        validationErrors[detail.path[0]] = detail.message;
      });
      setErrors(validationErrors);
      return;
    }

    setStatusMessage("Signing in...");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/institutes/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Invalid email or password");

      setLoginSuccess(true);
      setStatusMessage("Login successful! Redirecting...");
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("instituteId", data.instituteId);

      setTimeout(() => {
        navigate("/a/dashboard");
      }, 1500);
    } catch (err) {
      setStatusMessage("");
      setErrors((prev) => ({ ...prev, general: err.message }));
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-md p-8 relative z-10 border-white/10 shadow-2xl backdrop-blur-xl bg-black/40">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <span className="text-3xl font-bold text-white">BB</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/50">
            Sign in to access your admin dashboard
          </p>
        </div>

        <AnimatePresence mode="wait">
          {loginSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 text-emerald-500">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Login Successful!
              </h3>
              <p className="text-white/50">
                Redirecting you to the dashboard...
              </p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {errors.general && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{errors.general}</span>
                </div>
              )}

              <InputGroup
                label="Email Address"
                icon={Mail}
                type="email"
                name="email"
                placeholder="admin@institute.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />

              <div className="space-y-1">
                <InputGroup
                  label="Password"
                  icon={Lock}
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                />
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-white/50 hover:text-blue-400 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                variant="accent"
                fullWidth
                disabled={isLoading}
                className="py-3 text-base group"
              >
                {isLoading ? (
                  "Signing In..."
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In{" "}
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                )}
              </Button>

              <div className="text-center text-sm text-white/50 mt-6">
                Don't have an account?{" "}
                <Link
                  to="/a/signup"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Register Institute
                </Link>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default SigninPage;
