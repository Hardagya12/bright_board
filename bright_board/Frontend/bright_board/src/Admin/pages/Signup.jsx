import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Joi from "joi";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Lock,
  BookOpen,
  Key,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { API_BASE_URL } from "../../config/api";
import { PencilSVG, GradCapSVG, StarSVG, SparklesSVG } from "../../components/svg/SchoolIllustrations";

// Validation schemas
const schema = Joi.object({
  instituteName: Joi.string().min(3).max(50).required().messages({
    "string.min": "Institute name must be at least 3 characters",
    "string.max": "Institute name cannot exceed 50 characters",
    "string.empty": "Institute name is required",
  }),
  address: Joi.string().min(5).max(200).required().messages({
    "string.min": "Address must be at least 5 characters",
    "string.max": "Address cannot exceed 200 characters",
    "string.empty": "Address is required",
  }),
  contactNumber: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Contact number must be 10 digits",
      "string.empty": "Contact number is required",
    }),
  email: Joi.string().email({ tlds: false }).required().messages({
    "string.email": "Please enter a valid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
  }),
  courses: Joi.string().min(1).required().messages({
    "string.min": "Please enter at least one course",
    "string.empty": "Courses are required",
  }),
});

const otpSchema = Joi.string().length(6).pattern(/^\d+$/).required().messages({
  "string.length": "OTP must be 6 digits",
  "string.pattern.base": "OTP must contain only numbers",
  "string.empty": "OTP is required",
});

const InputGroup = ({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[12px] font-bold text-[#454745] uppercase tracking-wider font-body">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#868685] group-focus-within:text-[#0e0f0c] transition-colors">
        <Icon size={18} />
      </div>
      <input
        className={`input-wise pl-11 ${error ? "border-[#d03238] focus:border-[#d03238] focus:ring-1 focus:ring-[#d03238]" : ""}`}
        {...props}
      />
    </div>
    {error && (
      <p className="text-[12px] text-[#d03238] font-bold uppercase flex items-center gap-1.5 mt-1">
        <AlertCircle size={14} /> {error}
      </p>
    )}
  </div>
);

const SignupPage = () => {
  // State
  const [formData, setFormData] = useState({
    instituteName: "",
    address: "",
    contactNumber: "",
    email: "",
    password: "",
    courses: "",
  });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [otpError, setOtpError] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [registrationInProgress, setRegistrationInProgress] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");

  const navigate = useNavigate();

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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

  const handleOtpChange = (e) => {
    const value = e.target.value;
    setOtp(value);
    const { error } = otpSchema.validate(value);
    setOtpError(error ? error.message : "");
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();

    const { error } = Joi.object({
      email: schema.extract("email"),
    }).validate({ email: formData.email });

    if (error) {
      setErrors((prev) => ({ ...prev, email: error.details[0].message }));
      return;
    }

    setStatusMessage("Sending OTP...");
    setIsSending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/institutes/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setIsOtpSent(true);
      setStatusMessage("OTP sent to your email. Please check your inbox.");
      setCountdown(60);
    } catch (err) {
      setErrors((prev) => ({ ...prev, email: err.message }));
      setStatusMessage("");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const { error } = otpSchema.validate(otp);
    if (error) {
      setOtpError(error.message);
      return;
    }

    setStatusMessage("Verifying OTP...");
    setIsVerifying(true);

    try {
      const response = await fetch(`${API_BASE_URL}/institutes/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP");
      }

      setIsEmailVerified(true);
      setVerificationToken(data.verificationToken);
      setStatusMessage(
        "Email verified successfully! Complete your registration."
      );
    } catch (err) {
      setOtpError(err.message);
      setStatusMessage("");
    } finally {
      setIsVerifying(false);
    }
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

    if (!isEmailVerified) {
      setStatusMessage("Please verify your email with OTP first");
      return;
    }

    setStatusMessage("Registering your institute...");
    setRegistrationInProgress(true);

    try {
      const response = await fetch(`${API_BASE_URL}/institutes/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${verificationToken}`,
        },
        body: JSON.stringify({
          name: formData.instituteName,
          address: formData.address,
          contactNumber: formData.contactNumber,
          email: formData.email,
          password: formData.password,
          coursesOffered: formData.courses
            .split(",")
            .map((course) => course.trim()),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setIsRegistered(true);
      setStatusMessage(`Registration successful! Redirecting to dashboard...`);

      setTimeout(() => {
        navigate("/a/dashboard");
      }, 1500);
    } catch (err) {
      setStatusMessage(err.message);
    } finally {
      setRegistrationInProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bb-offwhite)] text-[var(--bb-black)] flex items-center justify-center p-4 relative overflow-hidden font-body py-12 notebook-lines">
      
      {/* Decorative SVG Elements */}
      <div className="absolute top-[10%] left-[10%] hidden md:block opacity-60">
        <PencilSVG size={120} />
      </div>
      <div className="absolute bottom-[10%] right-[10%] hidden md:block opacity-60">
        <GradCapSVG size={150} />
      </div>
      <div className="absolute top-[20%] right-[15%] hidden lg:block opacity-80">
        <StarSVG size={80} color="#9fe870" />
      </div>
      <div className="absolute bottom-[20%] left-[15%] hidden lg:block opacity-70">
        <SparklesSVG size={60} />
      </div>

      <Card variant="default" className="w-full max-w-lg p-6 md:p-8 relative z-10 my-auto shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-[16px] bg-[#e2f6d5] border-2 border-[#163300] shadow-[4px_4px_0_#163300] flex items-center justify-center mx-auto mb-6 relative animate-bounce-gentle">
            <Building2 size={32} className="text-[#163300]" />
          </div>
          <h1 className="text-4xl font-display text-[#0e0f0c] tracking-tight relative inline-block mb-2">
            {isRegistered
              ? "Registration Complete"
              : isEmailVerified
                ? "Complete Registration"
                : isOtpSent
                  ? "Verify Email"
                  : "Institute Registration"}
            <div className="doodle-underline w-full absolute bottom-[-4px] left-0"></div>
          </h1>
          <p className="text-[#454745] font-medium mt-2">
            Join the brightest platform for managing your institution.
          </p>
        </div>

        {statusMessage && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-3 ${isRegistered || isEmailVerified ? 'badge-green border border-[#054d28]/20' : 'badge-info border border-[#0066cc]/20'}`}>
            <CheckCircle2 size={18} /> {statusMessage}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Email Input Form */}
          {!isOtpSent && !isEmailVerified && !isRegistered && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleRequestOtp} 
              className="space-y-6"
            >
              <InputGroup
                label="Institute Email"
                icon={Mail}
                type="email"
                name="email"
                placeholder="admin@institute.edu"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />

              <Button type="submit" variant="primary" fullWidth disabled={isSending}>
                {isSending ? "Sending OTP..." : "Request OTP"}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/a/signin"
                  className="text-sm font-bold text-[#868685] hover:text-[#163300] transition-colors inline-block doodle-underline"
                >
                  Already registered? Sign In
                </Link>
              </div>
            </motion.form>
          )}

          {/* OTP Verification Form */}
          {isOtpSent && !isEmailVerified && !isRegistered && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleVerifyOtp} 
              className="space-y-6"
            >
              <InputGroup
                label="Enter Verification Code"
                icon={Key}
                type="text"
                placeholder="••••••"
                value={otp}
                onChange={handleOtpChange}
                maxLength={6}
                error={otpError}
                className="input-wise text-center tracking-[1em] text-lg font-bold"
              />

              <Button type="submit" variant="primary" fullWidth disabled={isVerifying}>
                {isVerifying ? "Verifying..." : "Verify OTP"}
              </Button>

              <div className="text-center font-bold text-sm text-[#868685] pt-2">
                {countdown > 0 ? (
                  <p>Resend code in {countdown}s</p>
                ) : (
                  <button
                    onClick={handleRequestOtp}
                    disabled={isSending}
                    className="text-[#163300] hover:text-[#054d28] transition-colors font-bold underline"
                    type="button"
                  >
                    Resend verification code
                  </button>
                )}
              </div>
            </motion.form>
          )}

          {/* Registration Form */}
          {isEmailVerified && !isRegistered && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit} 
              className="space-y-5"
            >
              <InputGroup
                label="Institute Name"
                icon={Building2}
                type="text"
                name="instituteName"
                placeholder="Bright Academy"
                value={formData.instituteName}
                onChange={handleChange}
                error={errors.instituteName}
              />

              <InputGroup
                label="Address"
                icon={MapPin}
                type="text"
                name="address"
                placeholder="123 Education Lane"
                value={formData.address}
                onChange={handleChange}
                error={errors.address}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputGroup
                  label="Contact Number"
                  icon={Phone}
                  type="text"
                  name="contactNumber"
                  placeholder="9876543210"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  error={errors.contactNumber}
                />

                <InputGroup
                  label="Email (Verified)"
                  icon={CheckCircle2}
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="input-wise pl-11 bg-[#e2f6d5] border-[#054d28]/20 text-[#054d28] opacity-80 cursor-not-allowed"
                />
              </div>

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

              <InputGroup
                label="Courses Offered"
                icon={BookOpen}
                type="text"
                name="courses"
                placeholder="Maths, Physics, Chem (comma separated)"
                value={formData.courses}
                onChange={handleChange}
                error={errors.courses}
              />

              <div className="pt-6">
                <Button type="submit" variant="primary" fullWidth disabled={registrationInProgress}>
                  {registrationInProgress ? "Registering..." : "Complete Registration"}
                </Button>
              </div>
            </motion.form>
          )}

          {/* Registration Success */}
          {isRegistered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-24 h-24 rounded-full bg-[#e2f6d5] border-4 border-[#163300] flex items-center justify-center mx-auto mb-6 text-[#163300] shadow-[6px_6px_0_#163300]">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-3xl font-display text-[#0e0f0c] mb-3">
                Welcome to BrightBoard!
              </h3>
              <p className="text-[#454745] font-medium text-lg">
                Redirecting you to your new dashboard...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default SignupPage;
