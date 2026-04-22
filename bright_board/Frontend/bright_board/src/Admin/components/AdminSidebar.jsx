import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';

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
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('instituteId');
    navigate('/');
  };

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-[280px]'} relative min-h-screen bg-black text-white border-r border-accent-primary/20 transition-all font-gill-sans`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-accent-primary to-accent-teal text-white border-none focus:outline-none hover:shadow-lg hover:shadow-accent-primary/50 transition-all"
        aria-label={isCollapsed ? "Expand AdminSidebar" : "Collapse AdminSidebar"}
      >
        {isCollapsed ? '>' : '<'}
      </button>

      <div className="h-16 flex items-center justify-center border-b border-accent-primary/20 bg-black">
        <h1 className={`${isCollapsed ? 'text-xl' : 'text-2xl'} font-comic font-bold tracking-wide bg-gradient-to-r from-white via-accent-primary to-accent-teal bg-clip-text text-transparent`}>
          {isCollapsed ? 'BB' : 'BrightBoard'}
        </h1>
      </div>

      <nav className="p-4">
        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.section}
              to={item.path}
              className={`w-full px-3 py-2 rounded-lg transition-all duration-300 text-left ${
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-accent-primary to-accent-teal text-white shadow-lg shadow-accent-primary/30' 
                  : 'hover:bg-accent-primary/10 hover:border-accent-primary/30 border border-transparent'
              }`}
              aria-current={location.pathname === item.path ? 'page' : undefined}
            >
              <div className="flex items-center gap-3">
                <span className="min-w-5">{item.icon}</span>
                <span className={`${isCollapsed ? 'opacity-0 w-0 invisible' : 'text-sm font-medium'}`}>{item.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>

      <button 
        onClick={handleLogout}
        className="absolute bottom-4 left-3 right-3 flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 border border-accent-error/30 hover:bg-accent-error hover:text-white hover:shadow-lg hover:shadow-accent-error/30 focus:outline-none" 
        aria-label="Logout"
      >
        <LogOut size={20} />
        <span className={`${isCollapsed ? 'opacity-0 w-0 invisible' : 'text-sm font-medium'}`}>Logout</span>
      </button>
    </aside>
  );
}