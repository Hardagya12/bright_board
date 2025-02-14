import React, { useState } from 'react';
import './ProfileStudent.css';
import pfp from '../images/pfp.jpg';
import { FaTachometerAlt, FaUser, FaBook, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt } from 'react-icons/fa';
import Sidebar from './Sidebar';

const StudentProfile = () => {
  const [activeTab, setActiveTab] = useState('Personal Info');

  return (
    <div className="profile-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <Sidebar />
      </div>



      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          
            <h1>My Profile</h1>
            <p>Your personal profile with quick insights and details.</p>
          
        </div>

        {/* Info Cards */}
        <div className="info-cards">
          <div className="card attendance-card">
            <h3>Attendance</h3>
            <div className="percentage">85%</div>
            <p>Classes Attended: 42/50</p>
            <button className="card-btn">View Details</button>
          </div>

          <div className="card results-card">
            <h3>Results</h3>
            <div className="recent-exam">
              <h4>Recent Exam:</h4>
              <p className="exam-name">Midterm Exam</p>
              <p>Grade: A</p>
            </div>
            <button className="card-btn">View All Results</button>
          </div>

          <div className="card payment-card">
            <h3>Payment Summary</h3>
            <div className="payment-details">
              <h4>Total Paid: ₹20,000</h4>
              <p className="pending-fees">Pending Fees: <span>₹5,000</span></p>
            </div>
            <button className="card-btn">Go to Payments</button>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="tabs-container">
          <div className="tabs-header">
            {['Personal Info', 'Academic Details', 'Achievements', 'Feedback & Ratings'].map(tab => (
              <button 
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'Personal Info' && (
              <div>
                <h3>Personal Info</h3>
                <p>Email: jabcd@gmail.com</p>
                <p>Phone: 999999999</p>
                <p>Address: XYZ Street, City, State, 123456</p>
              </div>
            )}
            {activeTab === 'Academic Details' && (
              <div>
                <h3>Academic Details</h3>
                <p>Current GPA: 8.7</p>
                <p>Upcoming Exam: Final Exam 2025</p>
              </div>
            )}
            {activeTab === 'Achievements' && (
              <div>
                <h3>Achievements</h3>
                <p>Top Scorer in Midterm Exam 2024</p>
              </div>
            )}
            {activeTab === 'Feedback & Ratings' && (
              <div>
                <h3>Feedback</h3>
                <p>Tutor Feedback: Great improvement in performance!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
