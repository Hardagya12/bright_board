import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './StudentSide/components/ProtectedRoutes';
import HomePage from './StudentSide/components/HomePage';
import StudentSignIn from './StudentSide/pages/SigninStudent';
import StudentSignUp from './StudentSide/pages/StudentSignup';
import DashboardStudent from './StudentSide/pages/DashboardStudent';
import StudentProfile from './StudentSide/pages/ProfileStudent';
import Result from './StudentSide/pages/Result';
import Exams from './StudentSide/pages/Exams';
import ExamAttempt from './StudentSide/pages/ExamAttempt';
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
import Support from './Admin/pages/Support';
import Settings from './Admin/pages/Settings';
import Feedback from './Admin/pages/Feedback';
import AdminSidebar from './Admin/components/AdminSidebar';
import './App.css';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <TransitionGroup>
      <CSSTransition key={location.pathname} classNames="page" timeout={300}>
        <Routes location={location}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/s/signin" element={<StudentSignIn />} />
        <Route path="/s/signup" element={<StudentSignUp />} />
        <Route path="/a/signin" element={<AdminSignin />} />
        <Route path="/a/signup" element={<AdminSignup />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/role" element={<RoleSelection />} />

        {/* Protected Student Routes */}
        <Route path="/s/dashboard" element={<ProtectedRoute allowedRoles={["student"]}><DashboardStudent /></ProtectedRoute>} />
        <Route path="/s/profile" element={<ProtectedRoute allowedRoles={["student"]}><StudentProfile /></ProtectedRoute>} />
        <Route path="/s/result" element={<ProtectedRoute allowedRoles={["student"]}><Result /></ProtectedRoute>} />
        <Route path="/s/exams" element={<ProtectedRoute allowedRoles={["student"]}><Exams /></ProtectedRoute>} />
        <Route path="/s/exams/:id" element={<ProtectedRoute allowedRoles={["student"]}><ExamAttempt /></ProtectedRoute>} />
        {/* Protected Admin Routes */}
        <Route path="/a/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/a/students" element={<ProtectedRoute allowedRoles={["admin"]}><StudentManagementPage /></ProtectedRoute>} />
        <Route path="/a/attendance" element={<ProtectedRoute allowedRoles={["admin"]}><AttendanceManagement /></ProtectedRoute>} />
        <Route path="/a/materials" element={<ProtectedRoute allowedRoles={["admin"]}><StudyMaterialManagement /></ProtectedRoute>} />
        <Route path="/a/exams" element={<ProtectedRoute allowedRoles={["admin"]}><AdminExam /></ProtectedRoute>} />
        <Route path="/a/results" element={<ProtectedRoute allowedRoles={["admin"]}><AdminResult /></ProtectedRoute>} />
        <Route path="/a/payments" element={<ProtectedRoute allowedRoles={["admin"]}><PaymentAdmin /></ProtectedRoute>} /> 
        <Route path="/a/support" element={<ProtectedRoute allowedRoles={["admin"]}><Support /></ProtectedRoute>} />
        <Route path="/a/settings" element={<ProtectedRoute allowedRoles={["admin"]}><Settings /></ProtectedRoute>} />
        <Route path="/a/feedback" element={<ProtectedRoute allowedRoles={["admin"]}><Feedback /></ProtectedRoute>} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AnimatedRoutes />
      </ErrorBoundary>
    </Router>
  );
}

export default App;
