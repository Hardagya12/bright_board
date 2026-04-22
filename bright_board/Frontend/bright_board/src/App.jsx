import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './StudentSide/components/ProtectedRoutes';
import HomePage from './StudentSide/components/HomePage';
import StudentSignIn from './StudentSide/pages/SigninStudent';

import DashboardStudent from './StudentSide/pages/DashboardStudent';
import StudentProfile from './StudentSide/pages/ProfileStudent';
import Result from './StudentSide/pages/Result';
import Exams from './StudentSide/pages/Exams';
import ExamAttempt from './StudentSide/pages/ExamAttempt';
import ExamWindow from './StudentSide/pages/ExamWindow';
import MyAttendance from './StudentSide/pages/MyAttendance';
import MyMaterials from './StudentSide/pages/MyMaterials';
import MyPayments from './StudentSide/pages/MyPayments';
import MyBatches from './StudentSide/pages/MyBatches';
import StudentFeedback from './StudentSide/pages/StudentFeedback';
import StudentSupport from './StudentSide/pages/StudentSupport';
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
          <Route path="/s/attendance" element={<ProtectedRoute allowedRoles={["student"]}><MyAttendance /></ProtectedRoute>} />
          <Route path="/s/materials" element={<ProtectedRoute allowedRoles={["student"]}><MyMaterials /></ProtectedRoute>} />
          <Route path="/s/payments" element={<ProtectedRoute allowedRoles={["student"]}><MyPayments /></ProtectedRoute>} />
          <Route path="/s/batches" element={<ProtectedRoute allowedRoles={["student"]}><MyBatches /></ProtectedRoute>} />
          <Route path="/s/feedback" element={<ProtectedRoute allowedRoles={["student"]}><StudentFeedback /></ProtectedRoute>} />
          <Route path="/s/support" element={<ProtectedRoute allowedRoles={["student"]}><StudentSupport /></ProtectedRoute>} />

          {/* Exam Window — NO sidebar, fullscreen only */}
          <Route path="/s/exam/:id" element={<ProtectedRoute allowedRoles={["student"]}><ExamWindow /></ProtectedRoute>} />

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
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-black"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]"></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-indigo-900/10 blur-[100px]"></div>
      </div>
      <div className="relative z-10 min-h-screen flex flex-col">
        <ErrorBoundary>
          <ToastProvider>
            <AnimatedRoutes />
          </ToastProvider>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;
