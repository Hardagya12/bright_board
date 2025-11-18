import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Users, Calendar, Star, ChevronDown } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { getInstituteProfile } from '../../utils/services/institute';
import { listStudents } from '../../utils/services/students';
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
  COLORS: ['#ffffff', '#cccccc', '#666666'],
});

const AdminDashboard = () => {
  const [selectedBatch, setSelectedBatch] = useState('Batch A');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dashboardData = getDashboardData();
  const batches = Object.keys(dashboardData.batches);
  const [live, setLive] = useState({ instituteName: '', studentCount: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [p, s] = await Promise.all([getInstituteProfile(), listStudents({ limit: 1 })]);
        setLive({ instituteName: p.data.institute?.name || '', studentCount: s.data.pagination?.total || (s.data.students?.length || 0) });
      } catch (e) {}
    };
    load();
  }, []);

  const StatCard = ({ icon: Icon, value, label, isRupee }) => (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center hover:bg-white/15 hover:-translate-y-1 transition-transform duration-300">
      {isRupee ? (
        <span className="block text-white text-5xl font-bold mb-4 drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)]">₹</span>
      ) : (
        Icon && <Icon className="w-12 h-12 text-white mb-4 drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)]" />
      )}
      <span className="block text-2xl font-bold text-white">{value}</span>
      <span className="block text-sm font-medium text-gray-300">{label}</span>
    </div>
  );

  const PieChartComponent = ({ title, data }) => (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 hover:-translate-y-1 transition-transform duration-300">
      <h2 className="text-lg font-medium text-gray-300 mb-4">{title}</h2>
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
    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
      <h2 className="text-lg font-medium text-gray-300 mb-4">Course & Platform Feedback</h2>
      {feedback.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-4 py-4 border-b border-white/10 last:border-b-0 hover:bg-white/15 transition-all duration-300"
        >
          <Star className="w-7 h-7 text-white drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)]" />
          <div>
            <p className="font-medium text-white text-base">{item.course}: {item.rating}/5</p>
            <span className="text-sm font-medium text-gray-300">{item.comment}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const batchData = dashboardData.batches[selectedBatch];

  return (
    <div className="min-h-screen flex font-inter bg-black text-white bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_50%)]">
      <AdminSidebar />
      <div className="flex-1 overflow-x-auto bg-black p-4">
        <h1 className="text-3xl font-bold text-center text-white drop-shadow-[0_0_30px_rgba(0,0,0,0.4)] mb-8">
          Admin Dashboard
        </h1>
        {live.instituteName && (
          <div className="mb-4 text-center text-bw-75">{live.instituteName} • Students: {live.studentCount}</div>
        )}
        <main>
          <div className="mb-8 relative inline-block w-52">
            <div
              className="flex items-center gap-2 p-3 rounded-lg bg-white/10 text-white text-base font-medium border border-white/10 cursor-pointer hover:bg-white hover:text-black hover:-translate-y-0.5 transition-all duration-300"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {selectedBatch}
              <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            {isDropdownOpen && (
              <ul className="absolute top-full left-0 w-full bg-white/5 border border-white/10 rounded-lg mt-2 p-2 z-10">
                {batches.map((batch) => (
                  <li
                    key={batch}
                    className="p-3 text-white text-base font-medium cursor-pointer hover:bg-white hover:text-black hover:pl-6 transition-all duration-300"
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

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            <StatCard icon={Users} value={batchData.totalStudents} label="Students" />
            <StatCard icon={Calendar} value={batchData.totalClasses} label="Classes" />
            <StatCard
              icon={null}
              value={`${batchData.pendingPayments.toLocaleString('en-IN')}`}
              label="Pending Payments"
              isRupee={true}
            />
            <StatCard
              icon={null}
              value={`${batchData.revenueThisMonth.toLocaleString('en-IN')}`}
              label="Revenue (Month)"
              isRupee={true}
            />
            <StatCard icon={Users} value={`${batchData.avgAttendance}%`} label="Avg. Attendance" />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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