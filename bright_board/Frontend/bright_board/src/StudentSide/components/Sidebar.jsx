import React, { useEffect, useState } from 'react';
import { FaTachometerAlt, FaUser, FaBook, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaCreditCard, FaComment, FaQuestionCircle, FaFolderOpen, FaLayerGroup } from 'react-icons/fa';
import { Menu, X, Home, BookOpen, Calendar, BarChart2, User } from 'lucide-react';
import api from '../../utils/api';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PencilSVG, SparklesSVG } from '../../components/svg/SchoolIllustrations';

const navItems = [
  { to: '/s/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
  { to: '/s/batches', icon: FaLayerGroup, label: 'My Batches' },
  { to: '/s/attendance', icon: FaCalendarAlt, label: 'My Attendance' },
  { to: '/s/materials', icon: FaFolderOpen, label: 'Study Materials' },
  { to: '/s/exams', icon: FaBook, label: 'My Exams' },
  { to: '/s/result', icon: FaChartBar, label: 'My Results' },
  { to: '/s/payments', icon: FaCreditCard, label: 'My Payments' },
  { to: '/s/feedback', icon: FaComment, label: 'Feedback' },
  { to: '/s/support', icon: FaQuestionCircle, label: 'Support' },
  { to: '/s/profile', icon: FaUser, label: 'My Profile' },
];

// Bottom nav items for mobile
const bottomNavItems = [
  { to: '/s/dashboard', icon: Home, label: 'Home' },
  { to: '/s/attendance', icon: Calendar, label: 'Attend' },
  { to: '/s/exams', icon: BookOpen, label: 'Exams' },
  { to: '/s/materials', icon: FaFolderOpen, label: 'Materials' },
  { to: '/s/profile', icon: User, label: 'Profile' },
];

const Sidebar = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('studentToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('studentName');
    localStorage.removeItem('instituteId');
    localStorage.removeItem('studentId');
    navigate('/s/signin');
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const sid = localStorage.getItem('studentId');
        const endpoint = sid ? `/students/by-student-id/${sid}` : '/students/me';
        const { data } = await api.get(endpoint);
        if (!cancelled) setProfile(data.student || null);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const name = profile?.name || 'Student';
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || 'S';
  const studentId = profile?.studentId || profile?._id || '';
  const batchName = profile?.batchId || '';

  const sidebarContent = (isMobile = false) => (
    <>
      {/* Subtle notebook lines */}
      <div className="absolute inset-0 notebook-lines opacity-15 pointer-events-none" />

      {/* Bottom decoration */}
      <div className="absolute bottom-4 left-4 opacity-15 pointer-events-none">
        <PencilSVG size={40} />
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
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 z-50 flex h-7 w-7 items-center justify-center rounded-full bg-[#9fe870] text-[#163300] border-2 border-white shadow-md hover:scale-110 transition-all"
          aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <span className="text-sm font-bold">{collapsed ? '›' : '‹'}</span>
        </button>
      )}

      {/* Profile Section */}
      <div className={`flex flex-col items-center p-4 ${(collapsed && !isMobile) ? 'py-4' : 'py-8'} border-b border-[#e8ebe6] relative z-10`}>
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-[#e2f6d5] border-2 border-[#9fe870] flex items-center justify-center text-xl font-display text-[#163300]" aria-label="Profile Avatar">
            {initial}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#9fe870] rounded-full border-2 border-white" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="mt-4 text-center">
            <h2 className="text-[#0e0f0c] text-base font-bold truncate max-w-[200px]">
              {name}
            </h2>
            {studentId && <p className="text-[#868685] text-[11px] mt-1 truncate max-w-full">ID: {studentId}</p>}
            {batchName && (
              <div className="mt-2 badge-green text-[10px]">
                {batchName}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto scrollbar-none relative z-10">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              title={(collapsed && !isMobile) ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-300 text-sm group overflow-hidden ${
                isActive
                  ? 'bg-[#9fe870] text-[#163300] font-bold shadow-sm'
                  : 'text-[#454745] hover:bg-[#e2f6d5] hover:text-[#163300]'
              }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2 relative z-10 border-t border-[#e8ebe6]">
        <Link
          to="/role"
          className="flex items-center justify-center gap-3 px-3 py-2.5 rounded-full transition-all duration-200 text-[#454745] hover:bg-[#e2f6d5] hover:text-[#163300] text-sm group"
        >
          <FaCog className="w-4 h-4 shrink-0 group-hover:rotate-90 transition-transform" />
          {(!collapsed || isMobile) && <span>Switch Role</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-3 py-2.5 bg-[#ffeaea] text-[#d03238] rounded-full cursor-pointer transition-all duration-300 hover:bg-[#ffd4d4] hover:scale-[1.02] text-sm font-bold group"
        >
          <FaSignOutAlt className="w-4 h-4 shrink-0 group-hover:-translate-x-1 transition-transform" />
          {(!collapsed || isMobile) && <span>Logout</span>}
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

      {/* Mobile sidebar (slide-in) */}
      <div
        className={`fixed top-0 left-0 h-full w-[270px] bg-white border-r border-[#e8ebe6] z-50 md:hidden transform transition-transform duration-300 flex flex-col overflow-hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent(true)}
      </div>

      {/* Desktop sidebar */}
      <div className={`${collapsed ? 'w-20' : 'w-[270px]'} relative bg-white text-[#0e0f0c] flex flex-col font-body border-r border-[#e8ebe6] transition-all duration-300 shrink-0 hidden md:flex z-40 overflow-hidden`}>
        {sidebarContent(false)}
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#e8ebe6] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-around h-16">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.to;
            const IconComp = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center gap-1 px-2 py-1 min-w-[56px] transition-colors ${
                  isActive ? 'text-[#163300]' : 'text-[#868685]'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-[#e2f6d5]' : ''}`}>
                  <IconComp size={18} className={isActive ? 'text-[#163300]' : undefined} />
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'text-[#163300]' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;