import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import SignIn from './components/SigninStudent';
import SignUp from './components/StudentSignup';
import DashboardStudent from './components/DashboardStudent';
import StudentProfile from './components/ProfileStudent'
import Result from './components/Result';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<DashboardStudent />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </Router>
  );
}

export default App;