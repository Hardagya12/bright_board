import React from 'react';
import './DashboardStudent.css';
import { Calendar, BookOpen, FileText, LayoutDashboard, CreditCard, UserCircle, MessageSquare, Check, X, Percent, Bell } from 'lucide-react';
import Sidebar from '../components/Sidebar';
const DashboardStudent = () => {
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
    <Sidebar />
      {/* Main Content */}
      <div className="main-content">
        <h1 className="welcome-text">Welcome, Student!</h1>

        {/* Metrics Cards */}
        <div className="metrics-container">
          <div className="metric-card attended">
            <div className="metric-header">
              <Check className="icon" />
              <span>Total Classes Attended</span>
            </div>
            <div className="metric-value">25</div>
          </div>

          <div className="metric-card missed">
            <div className="metric-header">
              <X className="icon" />
              <span>Total Classes Missed</span>
            </div>
            <div className="metric-value">5</div>
          </div>

          <div className="metric-card percentage">
            <div className="metric-header">
              <Percent className="icon" />
              <span>Attendance Percentage</span>
            </div>
            <div className="metric-value">83%</div>
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="section-container">
          <h2 className="section-title">Upcoming Exams</h2>
          <div className="exam-list">
            <div className="exam-item">
              <span>Math Midterm - 2023-10-20</span>
              <span className="status">Registration Open</span>
            </div>
            <div className="exam-item">
              <span>Science Final - 2023-10-25</span>
              <span className="status">Registration Open</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="section-container">
          <h2 className="section-title">Notifications</h2>
          <div className="notification-list">
            <div className="notification-item">
              <Bell className="icon" />
              <span>New assignment posted for Math.</span>
            </div>
            <div className="notification-item">
              <Bell className="icon" />
              <span>Science exam results are available.</span>
            </div>
            <div className="notification-item">
              <Bell className="icon" />
              <span>New message from your tutor.</span>
            </div>
          </div>
        </div>

        {/* Study Materials */}
        <div className="section-container">
          <h2 className="section-title">New Study Materials</h2>
          <div className="materials-list">
            <div className="material-item">
              <span className="material-title">Algebra Notes</span>
              <span className="upload-date">Uploaded on 2023-10-01</span>
            </div>
            <div className="material-item">
              <span className="material-title">Biology Study Guide</span>
              <span className="upload-date">Uploaded on 2023-10-02</span>
            </div>
            <div className="material-item">
              <span className="material-title">History Presentation</span>
              <span className="upload-date">Uploaded on 2023-10-03</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStudent;