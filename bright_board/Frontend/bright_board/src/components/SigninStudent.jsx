import React, { useState } from 'react';
import './SigninStudent.css';
import DashboardStudent from './DashboardStudent';
const StudentSignin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    instituteName: '',
    agreeToTerms: false,
    agreeToMarketing: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="signin-container">
      <div className="signin-content">
        {/* Left Section */}
        <div className="left-section">
          <h1>JOIN US</h1>
          <p>Get your Institute!</p>
        </div>

        {/* Right Section */}
        <div className="right-section">
          <form onSubmit={handleSubmit}>
            <h2>Sign in now</h2>
            
            <div className="name-row">
              <div className="form-group">
                <label htmlFor="firstName">First name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className="password-hint">
                Must be 8 chars minimum with a mix of letters, numbers & symbols
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="instituteName">Institute Name</label>
              <input
                type="text"
                id="instituteName"
                name="instituteName"
                value={formData.instituteName}
                onChange={handleInputChange}
                placeholder="Institute Name"
              />
            </div>

            <div className="checkbox-group">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                />
                <label htmlFor="agreeToTerms">
                  By creating an account, I agree to the{" "}
                  <a href="#">Terms of use</a> and{" "}
                  <a href="#">Privacy Policy</a>
                </label>
              </div>

              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="agreeToMarketing"
                  name="agreeToMarketing"
                  checked={formData.agreeToMarketing}
                  onChange={handleInputChange}
                />
                <label htmlFor="agreeToMarketing">
                  By creating an account, I am also consenting to receive SMS
                  messages and emails, including product new feature updates,
                  events, and marketing promotions.
                </label>
              </div>
            </div>

            <button type="submit" className="submit-button" onClick={() => history.push('/DashboardStudent')}> 
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentSignin;
