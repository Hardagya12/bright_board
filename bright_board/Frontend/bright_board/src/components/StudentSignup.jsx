import React, { useState } from "react";
import "./StudentSignup.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const StudentSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    instituteId: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("https://bright-board.onrender.com/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Signup successful! Please log in.");
        navigate('./DashboardStudent.jsx');
        setFormData({
          name: "",
          email: "",
          password: "",
          instituteId: "",
        });
      } else {
        setError(data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="signup-container">
      <div className="background-animation"></div>
      <form onSubmit={handleSubmit} className="signup-form">
        <h2 className="form-title">Create Account</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="input-group">
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder=" "
          />
          <label htmlFor="name">Name</label>
        </div>

        <div className="input-group">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder=" "
          />
          <label htmlFor="email">Email</label>
        </div>

        <div className="input-group password-group">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder=" "
          />
          <label htmlFor="password">Password</label>
          <span className="password-toggle" onClick={togglePasswordVisibility}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="input-group">
          <input
            type="text"
            id="instituteId"
            name="instituteId"
            value={formData.instituteId}
            onChange={handleChange}
            required
            placeholder=" "
          />
          <label htmlFor="instituteId">Institute ID</label>
        </div>

        <button type="submit" className="submit-btn">Sign Up</button>
      </form>
    </div>
  );
};

export default StudentSignup;
