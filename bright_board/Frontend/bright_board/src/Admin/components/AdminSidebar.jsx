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
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-[280px]'} relative min-h-screen bg-black text-white border-r border-bw-12 transition-all font-gill-sans`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-bw-12 text-white border border-bw-37 focus:outline-none hover:bg-bw-25"
        aria-label={isCollapsed ? "Expand AdminSidebar" : "Collapse AdminSidebar"}
      >
        {isCollapsed ? '>' : '<'}
      </button>

      <div className="h-16 flex items-center justify-center border-b border-bw-12 bg-black">
        <h1 className={`${isCollapsed ? 'text-xl' : 'text-2xl'} font-comic font-bold tracking-wide`}>
          {isCollapsed ? 'BB' : 'BrightBoard'}
        </h1>
      </div>

      <nav className="p-4">
        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.section}
              to={item.path}
              className={`w-full px-3 py-2 rounded-lg transition text-left ${activeSection === item.section ? 'bg-bw-12' : 'hover:bg-bw-12'}`}
              onClick={() => setActiveSection(item.section)}
              aria-current={activeSection === item.section ? 'page' : undefined}
            >
              <div className="flex items-center gap-3">
                <span className="min-w-5">{item.icon}</span>
                <span className={`${isCollapsed ? 'opacity-0 w-0 invisible' : 'text-sm font-medium text-bw-75'}`}>{item.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>

      <button className="absolute bottom-4 left-3 right-3 flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-bw-12 focus:outline-none" aria-label="Logout">
        <LogOut size={20} />
        <span className={`${isCollapsed ? 'opacity-0 w-0 invisible' : 'text-sm font-medium text-bw-75'}`}>Logout</span>
      </button>
    </aside>
  );
}