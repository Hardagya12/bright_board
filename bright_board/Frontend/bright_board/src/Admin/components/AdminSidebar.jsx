import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ClipboardCheck, BookOpen,
  GraduationCap, LineChart, CreditCard, MessageSquare,
  LifeBuoy, Settings, LogOut, Menu, X,
} from 'lucide-react';
import { GradCapSVG, SparklesSVG } from '../../components/svg/SchoolIllustrations';

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('instituteId');
    navigate('/');
  };

  const sidebarContent = (isMobile = false) => (
    <>
      {/* Notebook lines */}
      <div className="absolute inset-0 notebook-lines opacity-15 pointer-events-none" />

      {/* Bottom decoration */}
      <div className="absolute bottom-8 left-4 opacity-10 pointer-events-none">
        <GradCapSVG size={50} />
      </div>

      {/* Close button (mobile only) */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-[#f9faf6] flex items-center justify-center text-[#868685] hover:text-[#0e0f0c] transition-colors"
        >
          <X size={18} />
        </button>
      )}

      {/* Collapse toggle (desktop only) */}
      {!isMobile && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 z-50 flex h-7 w-7 items-center justify-center rounded-full bg-[#9fe870] text-[#163300] border-2 border-white shadow-md hover:scale-110 transition-all"
          aria-label={isCollapsed ? "Expand AdminSidebar" : "Collapse AdminSidebar"}
        >
          <span className="text-sm font-bold">{isCollapsed ? '›' : '‹'}</span>
        </button>
      )}

      <div className="h-20 flex items-center justify-center border-b border-[#e8ebe6] relative px-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 bg-[#9fe870] rounded-full flex items-center justify-center text-[#163300] text-sm font-bold shrink-0">B</span>
          {(!isCollapsed || isMobile) && (
            <h1 className="text-2xl font-display text-[#0e0f0c] tracking-tight">
              BrightBoard
            </h1>
          )}
        </div>
      </div>

      <nav className="p-3 relative z-10 h-[calc(100vh-160px)] overflow-y-auto scrollbar-none">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.section}
                to={item.path}
                className={`w-full px-3 py-2.5 rounded-full transition-all duration-300 text-left relative group overflow-hidden ${
                  isActive
                    ? 'bg-[#9fe870] text-[#163300] font-bold shadow-sm' 
                    : 'text-[#454745] hover:text-[#163300] hover:bg-[#e2f6d5]'
                }`}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <span className={`min-w-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                  <span className={`${(!isMobile && isCollapsed) ? 'opacity-0 w-0 hidden' : 'text-sm font-semibold'}`}>{item.title}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-4 left-3 right-3 z-10">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-full transition-all duration-300 bg-[#ffeaea] text-[#d03238] hover:bg-[#ffd4d4] hover:scale-[1.02] focus:outline-none group" 
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className={`${(!isMobile && isCollapsed) ? 'opacity-0 w-0 hidden' : 'text-sm font-bold'}`}>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-full bg-white border border-[#e8ebe6] shadow-sm flex items-center justify-center text-[#0e0f0c] hover:bg-[#e2f6d5] transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[270px] bg-white border-r border-[#e8ebe6] z-50 md:hidden transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-hidden`}
      >
        {sidebarContent(true)}
      </aside>

      {/* Desktop sidebar */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-[270px]'} relative min-h-screen bg-white text-[#0e0f0c] border-r border-[#e8ebe6] transition-all font-body z-40 overflow-hidden hidden md:block`}>
        {sidebarContent(false)}
      </aside>
    </>
  );
}