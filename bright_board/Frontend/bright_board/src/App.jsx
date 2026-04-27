import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './StudentSide/components/ProtectedRoutes';
import './App.css';

// ─── Lazy-loaded pages ───────────────────────────────
// Public
const HomePage = lazy(() => import('./StudentSide/components/HomePage'));
const RoleSelection = lazy(() => import('./StudentSide/components/RoleSelection'));
const StudentSignIn = lazy(() => import('./StudentSide/pages/SigninStudent'));
const AdminSignin = lazy(() => import('./Admin/pages/Signin'));
const AdminSignup = lazy(() => import('./Admin/pages/Signup'));
const ForgotPasswordPage = lazy(() => import('./Admin/pages/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('./Admin/pages/ResetPassword'));

// Student
const DashboardStudent = lazy(() => import('./StudentSide/pages/DashboardStudent'));
const StudentProfile = lazy(() => import('./StudentSide/pages/ProfileStudent'));
const Result = lazy(() => import('./StudentSide/pages/Result'));
const Exams = lazy(() => import('./StudentSide/pages/Exams'));
const ExamAttempt = lazy(() => import('./StudentSide/pages/ExamAttempt'));
const ExamWindow = lazy(() => import('./StudentSide/pages/ExamWindow'));
const MyAttendance = lazy(() => import('./StudentSide/pages/MyAttendance'));
const MyMaterials = lazy(() => import('./StudentSide/pages/MyMaterials'));
const MyPayments = lazy(() => import('./StudentSide/pages/MyPayments'));
const MyBatches = lazy(() => import('./StudentSide/pages/MyBatches'));
const StudentFeedback = lazy(() => import('./StudentSide/pages/StudentFeedback'));
const StudentSupport = lazy(() => import('./StudentSide/pages/StudentSupport'));

// Admin
const AdminDashboard = lazy(() => import('./Admin/pages/AdminDashboard'));
const StudentManagementPage = lazy(() => import('./Admin/pages/StudentManagementPage'));
const AttendanceManagement = lazy(() => import('./Admin/pages/AttendanceManagement'));
const StudyMaterialManagement = lazy(() => import('./Admin/pages/StudyMaterialManagement'));
const AdminExam = lazy(() => import('./Admin/pages/ExamManagement'));
const CreateExam = lazy(() => import('./Admin/pages/CreateExam'));
const AdminResult = lazy(() => import('./Admin/pages/ResultManagement'));
const PaymentAdmin = lazy(() => import('./Admin/pages/PaymentAdmin'));
const Support = lazy(() => import('./Admin/pages/Support'));
const Settings = lazy(() => import('./Admin/pages/Settings'));
const Feedback = lazy(() => import('./Admin/pages/Feedback'));

// 404
const NotFound = lazy(() => import('./pages/NotFound'));

// ─── Page Loading Spinner ────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen bg-[#f9faf6] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-[#e8ebe6] rounded-full"></div>
        <div className="w-12 h-12 border-4 border-[#9fe870] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <span className="text-[#868685] text-sm font-semibold tracking-wider">Loading...</span>
    </div>
  </div>
);

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Suspense fallback={<PageLoader />}>
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
            <Route path="/a/exams/create" element={<ProtectedRoute allowedRoles={["admin"]}><CreateExam /></ProtectedRoute>} />
            <Route path="/a/results" element={<ProtectedRoute allowedRoles={["admin"]}><AdminResult /></ProtectedRoute>} />
            <Route path="/a/payments" element={<ProtectedRoute allowedRoles={["admin"]}><PaymentAdmin /></ProtectedRoute>} />
            <Route path="/a/support" element={<ProtectedRoute allowedRoles={["admin"]}><Support /></ProtectedRoute>} />
            <Route path="/a/settings" element={<ProtectedRoute allowedRoles={["admin"]}><Settings /></ProtectedRoute>} />
            <Route path="/a/feedback" element={<ProtectedRoute allowedRoles={["admin"]}><Feedback /></ProtectedRoute>} />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CSSTransition>
      </TransitionGroup>
    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <div className="relative z-10 min-h-screen flex flex-col bg-[#f9faf6]">
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
