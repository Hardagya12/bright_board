import React, { useEffect, useState } from 'react';
import { FaTachometerAlt, FaUser, FaBook, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaCreditCard, FaComment, FaQuestionCircle, FaFolderOpen, FaLayerGroup } from 'react-icons/fa';
import api from '../../utils/api';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/s/dashboard', icon: FaTachometerAlt, label: 'Dashboard', color: 'accent-primary' },
  { to: '/s/batches', icon: FaLayerGroup, label: 'My Batches', color: 'blue-500' },
  { to: '/s/attendance', icon: FaCalendarAlt, label: 'My Attendance', color: 'emerald-500' },
  { to: '/s/materials', icon: FaFolderOpen, label: 'Study Materials', color: 'purple-500' },
  { to: '/s/exams', icon: FaBook, label: 'My Exams', color: 'accent-info' },
  { to: '/s/result', icon: FaChartBar, label: 'My Results', color: 'accent-success' },
  { to: '/s/payments', icon: FaCreditCard, label: 'My Payments', color: 'amber-500' },
  { to: '/s/feedback', icon: FaComment, label: 'Feedback', color: 'pink-500' },
  { to: '/s/support', icon: FaQuestionCircle, label: 'Support', color: 'cyan-500' },
  { to: '/s/profile', icon: FaUser, label: 'My Profile', color: 'accent-primary' },
];

const Sidebar = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

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
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const sid = localStorage.getItem('studentId');
        const endpoint = sid ? `/students/by-student-id/${sid}` : '/students/me';
        const { data } = await api.get(endpoint);
        setProfile(data.student || null);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const name = profile?.name || 'Student';
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || 'S';
  const studentId = profile?.studentId || profile?._id || '';
  const batchName = profile?.batchId || '';

  return (
    <div className={`${collapsed ? 'w-[72px]' : 'w-[260px]'} bg-black text-white flex flex-col font-gill-sans border-r border-accent-primary/20 transition-all duration-300 shrink-0 hidden md:flex`}>
      {/* Profile Section */}
      <div className={`flex flex-col items-center p-4 ${collapsed ? 'py-4' : 'py-6'}`}>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary to-accent-teal flex items-center justify-center text-lg font-comic shadow-lg shadow-accent-primary/30" aria-label="Profile Avatar">
          {initial}
        </div>
        {!collapsed && (
          <>
            <h2 className="text-white text-sm font-comic mt-2 truncate max-w-full">{name}</h2>
            {studentId && <p className="text-bw-62 text-[10px] truncate max-w-full">ID: {studentId}</p>}
            {batchName && (
              <span className="mt-1 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] rounded-full truncate max-w-full">
                {batchName}
              </span>
            )}
          </>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2 no-underline rounded-lg transition-all duration-200 border text-sm ${
                isActive
                  ? 'bg-gradient-to-r from-accent-primary to-accent-teal text-white shadow-lg shadow-accent-primary/30 border-transparent'
                  : 'text-bw-75 hover:bg-white/5 hover:text-white border-transparent'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 space-y-1">
        <Link
          to="/role"
          className="flex items-center gap-3 px-3 py-2 no-underline rounded-lg transition-all duration-200 text-bw-75 hover:bg-white/5 hover:text-white text-sm"
        >
          <FaCog className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Switch Role</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 border border-accent-error/30 text-white rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent-error hover:shadow-lg hover:shadow-accent-error/30 text-sm"
        >
          <FaSignOutAlt className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;