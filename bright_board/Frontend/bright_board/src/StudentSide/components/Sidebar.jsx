import React, { useEffect, useState } from 'react';
import { FaTachometerAlt, FaUser, FaBook, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaCreditCard, FaComment } from 'react-icons/fa';
import api from '../../utils/api';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

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
  }, [location.pathname]);

  const name = profile?.name || 'Student';
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || 'S';
  const studentId = profile?.studentId || profile?._id || '';
  const courseInfo = profile?.course ? `Course: ${profile.course}` : '';

  return (
    <div className="w-[260px] bg-black text-white p-6 flex flex-col font-gill-sans border-r border-bw-12">
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-bw-12 flex items-center justify-center text-2xl font-comic" aria-label="Profile Avatar">{initial}</div>
        <h2 className="text-white text-lg font-comic mt-2">{name}</h2>
        {studentId && <p className="text-bw-62 text-sm">Student ID: {studentId}</p>}
        {courseInfo && <p className="text-bw-62 text-sm">{courseInfo}</p>}
        {loading && <p className="text-bw-62 text-sm">Loading...</p>}
        {error && <p className="text-bw-62 text-sm">{error}</p>}
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        <Link to="/s/dashboard" className="flex items-center gap-3 px-3 py-2 text-bw-75 no-underline rounded-md transition-colors hover:bg-bw-12">
          <FaTachometerAlt className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
        <Link to="/s/profile" className="flex items-center gap-3 px-3 py-2 text-bw-75 no-underline rounded-md transition-colors hover:bg-bw-12">
          <FaUser className="w-5 h-5" />
          <span>Personal Info</span>
        </Link>
        <Link to="/s/exams" className="flex items-center gap-3 px-3 py-2 text-bw-75 no-underline rounded-md transition-colors hover:bg-bw-12">
          <FaBook className="w-5 h-5" />
          <span>Exams</span>
        </Link>
        <Link to="/s/result" className="flex items-center gap-3 px-3 py-2 text-bw-75 no-underline rounded-md transition-colors hover:bg-bw-12">
          <FaChartBar className="w-5 h-5" />
          <span>Results</span>
        </Link>
        <Link to="/role" className="flex items-center gap-3 px-3 py-2 text-bw-75 no-underline rounded-md transition-colors hover:bg-bw-12">
          <FaCog className="w-5 h-5" />
          <span>Switch Role</span>
        </Link>
      </nav>
      <button className="mt-4 px-3 py-2 border border-bw-37 text-white rounded-md cursor-pointer transition-colors hover:bg-bw-12 flex items-center gap-2" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('studentToken'); localStorage.removeItem('authToken'); navigate('/s/signin'); }}>
        <FaSignOutAlt className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;