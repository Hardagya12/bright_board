import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BookOpen,
  GraduationCap,
  LineChart,
  CreditCard,
  MessageSquare,
  LifeBuoy,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import './AdminSidebar.css';

const navItems = [
  { title: 'Dashboard', icon: <LayoutDashboard size={20} />, section: 'dashboard', path: '/a/dashboard' },
  { title: 'Students', icon: <Users size={20} />, section: 'students', path: '/a/students' },
  { title: 'Attendance', icon: <ClipboardCheck size={20} />, section: 'attendance', path: '/a/attendance' },
  { title: 'Study Materials', icon: <BookOpen size={20} />, section: 'materials', path: '/a/materials' },
  { title: 'Exams', icon: <GraduationCap size={20} />, section: 'exams', path: '/a/exams' },
  { title: 'Results', icon: <LineChart size={20} />, section: 'results', path: '/a/results' },
  { title: 'Payments', icon: <CreditCard size={20} />, section: 'payments', path: '/a/payments' },
  { title: 'Feedback', icon: <MessageSquare size={20} />, section: 'feedback', path: '/a/feedback' },
  { title: 'Support', icon: <LifeBuoy size={20} />, section: 'support', path: '/a/support' },
  { title: 'Settings', icon: <Settings size={20} />, section: 'settings', path: '/a/settings' },
];

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <aside className={`admin-AdminSidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="toggle-button"
        aria-label={isCollapsed ? "Expand AdminSidebar" : "Collapse AdminSidebar"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="AdminSidebar-header">
        <h1 className="logo">
          {isCollapsed ? 'BB' : 'BrightBoard'}
        </h1>
      </div>

      <nav className="nav-menu">
        <div className="menu-items">
          {navItems.map((item) => (
            <Link
              key={item.section}
              to={item.path}
              className={`menu-item ${activeSection === item.section ? 'active' : ''}`}
              onClick={() => setActiveSection(item.section)}
              aria-current={activeSection === item.section ? 'page' : undefined}
            >
              <div className="item-content">
                <span className="item-icon">{item.icon}</span>
                <span className="item-text">{item.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>

      <button
        className="lgbtn"
        aria-label="Logout"
      >
        <LogOut size={20} />
        <span className="logout-text">Logout</span>
      </button>
    </aside>
  );
}