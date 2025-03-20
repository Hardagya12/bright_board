import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './StudentSide/components/HomePage';
import StudentSignIn from './StudentSide/pages/SigninStudent';
import StudentSignUp from './StudentSide/pages/StudentSignup';
import DashboardStudent from './StudentSide/pages/DashboardStudent';
import StudentProfile from './StudentSide/pages/ProfileStudent';
import Result from './StudentSide/pages/Result';
import AdminDashboard from './Admin/pages/AdminDashboard';
import StudentManagementPage from './Admin/pages/StudentManagementPage';
import AttendanceManagement from './Admin/pages/AttendanceManagement';
import StudyMaterialManagement from './Admin/pages/StudyMaterialManagement';
import AdminSignup from './Admin/pages/Signup';
import AdminExam from './Admin/pages/ExamManagement';
import AdminResult from './Admin/pages/ResultManagement';
import RoleSelection from './StudentSide/components/RoleSelection';
import AdminSignin from './Admin/pages/Signin';
import ForgotPasswordPage from './Admin/pages/ForgotPassword';
import ResetPasswordPage from './Admin/pages/ResetPassword';
import PaymentAdmin from './Admin/pages/PaymentAdmin';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/s/signin" element={<StudentSignIn />} />
        <Route path="/s/signup" element={<StudentSignUp />} />
        <Route path="/a/signin" element={<AdminSignin />} />
        <Route path="/a/signup" element={<AdminSignup />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/role" element={<RoleSelection />} />

        {/* Unprotected Routes */}
        <Route path="/s/dashboard" element={<DashboardStudent />} />
        <Route path="/s/profile" element={<StudentProfile />} />
        <Route path="/s/result" element={<Result />} />
        <Route path="/a/dashboard" element={<AdminDashboard />} />
        <Route path="/a/students" element={<StudentManagementPage />} />
        <Route path="/a/attendance" element={<AttendanceManagement />} />
        <Route path="/a/materials" element={<StudyMaterialManagement />} />
        <Route path="/a/exams" element={<AdminExam />} />
        <Route path="/a/results" element={<AdminResult />} />
        <Route path="/a/payments" element={<PaymentAdmin />} /> 
      </Routes>
    </Router>
  );
}

export default App;
