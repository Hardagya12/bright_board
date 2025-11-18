import React from 'react';
import { FaTachometerAlt, FaUser, FaBook, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaCreditCard, FaComment } from 'react-icons/fa';
import pfp from '../images/pfp.jpg';

const Sidebar = () => {
  return (
    <div className="w-[260px] bg-black text-white p-6 flex flex-col font-gill-sans border-r border-bw-12">
      <div className="flex flex-col items-center mb-6">
        <img src={pfp} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
        <h2 className="text-white text-lg font-comic mt-2">Hardagya Rajput</h2>
        <p className="text-bw-62 text-sm">Roll Number: STU2025001</p>
        <p className="text-bw-62 text-sm">Course: B.Tech CSE, 1st Year</p>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-bw-75 no-underline rounded-md transition-colors hover:bg-bw-12">
          <FaTachometerAlt className="w-5 h-5" />
          <span>Dashboard</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-bw-75 no-underline rounded-md transition-colors hover:bg-bw-12">
          <FaUser className="w-5 h-5" />
          <span>Personal Info</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-bw-75 no-underline rounded-md transition-colors hover:bg-bw-12">
          <FaBook className="w-5 h-5" />
          <span>Academic Info</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-bw-75 no-underline rounded-md transition-colors hover:bg-bw-12">
          <FaCalendarAlt className="w-5 h-5" />
          <span>Attendance</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-bw-75 no-underline rounded-md transition-colors hover:bg-bw-12">
          <FaChartBar className="w-5 h-5" />
          <span>Results</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-bw-75 no-underline rounded-md transition-colors hover:bg-bw-12">
          <FaCreditCard className="w-5 h-5" />
          <span>Payment</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-bw-75 no-underline rounded-md transition-colors hover:bg-bw-12">
          <FaComment className="w-5 h-5" />
          <span>Feedback</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-bw-75 no-underline rounded-md transition-colors hover:bg-bw-12">
          <FaCog className="w-5 h-5" />
          <span>Settings</span>
        </a>
      </nav>
      <button className="mt-4 px-3 py-2 border border-bw-37 text-white rounded-md cursor-pointer transition-colors hover:bg-bw-12 flex items-center gap-2">
        <FaSignOutAlt className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;