import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import SignIn from './components/SigninStudent';
import SignUp from './components/StudentSignup';
import DashboardStudent from './components/DashboardStudent';
import StudentProfile from './components/ProfileStudent'
import Result from './components/Result';
import AdminDashboard from './Admin/pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ssignin" element={<SignIn />} />
        <Route path="/ssignup" element={<SignUp />} />
        <Route path="/sdashboard" element={<DashboardStudent />} />
        <Route path="/sprofile" element={<StudentProfile />} />
        <Route path="/sresult" element={<Result />} />
        <Route path="/a/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;