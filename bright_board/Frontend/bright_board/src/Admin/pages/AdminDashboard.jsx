import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Users, Calendar, Star, ChevronDown } from 'lucide-react'; // Removed DollarSign
import './AdminDashboard.css';
import AdminSidebar from '../components/AdminSidebar';

// Mock data simulating backend response with batch-specific data
const getDashboardData = () => ({
  batches: {
    'Batch A': {
      totalStudents: 250,
      totalClasses: 80,
      pendingPayments: 1500,
      revenueThisMonth: 5000,
      avgAttendance: 85,
      attendanceData: [
        { name: 'Present', value: 82 },
        { name: 'Absent', value: 10 },
        { name: 'Late', value: 8 },
      ],
      examScores: [
        { name: '90-100', value: 35 },
        { name: '70-89', value: 50 },
        { name: 'Below 70', value: 15 },
      ],
      paymentStatus: [
        { name: 'Paid', value: 70 },
        { name: 'Overdue', value: 20 },
        { name: 'Pending', value: 10 },
      ],
      feedback: [
        { course: 'Mathematics', rating: 4.8, comment: 'Very engaging!' },
        { course: 'Physics', rating: 4.5, comment: 'Clear concepts.' },
        { course: 'Platform', rating: 4.6, comment: 'Smooth navigation.' },
      ],
    },
    'Batch B': {
      totalStudents: 300,
      totalClasses: 90,
      pendingPayments: 2500,
      revenueThisMonth: 4500,
      avgAttendance: 78,
      attendanceData: [
        { name: 'Present', value: 72 },
        { name: 'Absent', value: 18 },
        { name: 'Late', value: 10 },
      ],
      examScores: [
        { name: '90-100', value: 20 },
        { name: '70-89', value: 40 },
        { name: 'Below 70', value: 40 },
      ],
      paymentStatus: [
        { name: 'Paid', value: 55 },
        { name: 'Overdue', value: 35 },
        { name: 'Pending', value: 10 },
      ],
      feedback: [
        { course: 'Mathematics', rating: 4.1, comment: 'Needs slower pace.' },
        { course: 'Chemistry', rating: 3.9, comment: 'More labs needed.' },
        { course: 'Platform', rating: 4.3, comment: 'Decent usability.' },
      ],
    },
    'Batch C': {
      totalStudents: 230,
      totalClasses: 75,
      pendingPayments: 1200,
      revenueThisMonth: 6000,
      avgAttendance: 90,
      attendanceData: [
        { name: 'Present', value: 90 },
        { name: 'Absent', value: 6 },
        { name: 'Late', value: 4 },
      ],
      examScores: [
        { name: '90-100', value: 45 },
        { name: '70-89', value: 40 },
        { name: 'Below 70', value: 15 },
      ],
      paymentStatus: [
        { name: 'Paid', value: 80 },
        { name: 'Overdue', value: 10 },
        { name: 'Pending', value: 10 },
      ],
      feedback: [
        { course: 'Biology', rating: 4.9, comment: 'Fantastic content!' },
        { course: 'Physics', rating: 4.7, comment: 'Well-organized.' },
        { course: 'Platform', rating: 4.8, comment: 'Top-notch experience.' },
      ],
    },
  },
  COLORS: ['#10b981', '#f87171', '#fbbf24'],
});

const AdminDashboard = () => {
  const [selectedBatch, setSelectedBatch] = useState('Batch A');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dashboardData = getDashboardData();
  const batches = Object.keys(dashboardData.batches);

  const StatCard = ({ icon: Icon, value, label, isRupee }) => (
    <motion.div className="admin-stat-card" whileHover={{ scale: 1.05 }}>
      {isRupee ? (
        <span className="admin-rupee-icon">₹</span> // Custom Rupee symbol
      ) : (
        <Icon className="admin-icon" />
      )}
      <span className="admin-stat-value">{value}</span>
      <span className="admin-stat-label">{label}</span>
    </motion.div>
  );

  const PieChartComponent = ({ title, data }) => (
    <div className="admin-chart-container">
      <h2>{title}</h2>
      <PieChart width={350} height={300}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={100}
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          labelLine={true}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={dashboardData.COLORS[index % dashboardData.COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );

  const FeedbackList = ({ feedback }) => (
    <div className="admin-feedback-container">
      <h2>Course & Platform Feedback</h2>
      {feedback.map((item, index) => (
        <motion.div
          key={index}
          className="admin-feedback-item"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Star className="admin-icon" />
          <div>
            <p>{item.course}: {item.rating}/5</p>
            <span>{item.comment}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const batchData = dashboardData.batches[selectedBatch];

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-dashboard-content">
        <main>
          <div className="admin-batch-selector">
            <div
              className="admin-batch-toggle"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {selectedBatch} <ChevronDown className="admin-dropdown-icon" />
            </div>
            {isDropdownOpen && (
              <ul className="admin-batch-options">
                {batches.map((batch) => (
                  <li
                    key={batch}
                    className="admin-batch-option"
                    onClick={() => {
                      setSelectedBatch(batch);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {batch}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <section className="admin-overview-grid">
            <StatCard icon={Users} value={batchData.totalStudents} label="Students" />
            <StatCard icon={Calendar} value={batchData.totalClasses} label="Classes" />
            <StatCard
              icon={null} // No icon prop, using custom Rupee
              value={`${batchData.pendingPayments.toLocaleString('en-IN')}`}
              label="Pending Payments"
              isRupee={true}
            />
            <StatCard
              icon={null} // No icon prop, using custom Rupee
              value={`${batchData.revenueThisMonth.toLocaleString('en-IN')}`}
              label="Revenue (Month)"
              isRupee={true}
            />
            <StatCard icon={Users} value={`${batchData.avgAttendance}%`} label="Avg. Attendance" />
          </section>

          <section className="admin-insights-grid">
            <PieChartComponent title="Attendance Breakdown" data={batchData.attendanceData} />
            <PieChartComponent title="Payment Status" data={batchData.paymentStatus} />
            <PieChartComponent title="Exam Score Distribution" data={batchData.examScores} />
            <FeedbackList feedback={batchData.feedback} />
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;