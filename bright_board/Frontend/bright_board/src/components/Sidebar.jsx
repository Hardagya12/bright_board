import React from 'react';
import { FaTachometerAlt, FaUser, FaBook, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaCreditCard, FaComment } from 'react-icons/fa';
import pfp from '../images/pfp.jpg';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="profile-image-container">
        <img 
          src={pfp} 
          alt="Profile" 
          className="profile-image" 
        />
        <h2 className="profile-name">Hardagya Rajput</h2>
        <p className="profile-details">Roll Number: STU2025001</p>
        <p className="profile-details">Course: B.Tech CSE, 1st Year</p>
      </div>

      <nav className="sidebar-nav">
        <a href="#" className="nav-item">
          <FaTachometerAlt className="icon" />
          Dashboard
        </a>
        <a href="#" className="nav-item">
          <FaUser className="icon" />
          Personal Info
        </a>
        <a href="#" className="nav-item">
          <FaBook className="icon" />
          Academic Info
        </a>
        <a href="#" className="nav-item">
          <FaCalendarAlt className="icon" />
          Attendance
        </a>
        <a href="#" className="nav-item">
          <FaChartBar className="icon" />
          Results
        </a>
        <a href="#" className="nav-item">
          <FaCreditCard className="icon" />
          Payment
        </a>
        <a href="#" className="nav-item">
          <FaComment className="icon" />
          Feedback
        </a>
        <a href="#" className="nav-item">
          <FaCog className="icon" />
          Settings
        </a>
      </nav>
      <button className="logout-btn">
        <FaSignOutAlt className="icon" />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;