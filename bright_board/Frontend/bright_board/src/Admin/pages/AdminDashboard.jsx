import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Users, Calendar, Star, ChevronDown } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { getInstituteProfile } from '../../utils/services/institute';
import { listStudents } from '../../utils/services/students';
import { listBatches } from '../../utils/services/batches';
import { getAttendanceStats, listAttendance } from '../../utils/services/attendance';
import { getPaymentsSummary } from '../../utils/services/payments';
import { getResultsAnalytics } from '../../utils/services/results';
import { listTickets } from '../../utils/services/support';
const COLORS = ['#ffffff', '#cccccc', '#666666'];

const AdminDashboard = () => {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [batches, setBatches] = useState([]);
  const [live, setLive] = useState({ instituteName: '', studentCount: 0 });
  const [cards, setCards] = useState({ totalStudents: 0, totalClasses: 0, pendingPayments: 0, revenueThisMonth: 0, avgAttendance: 0 });
  const [attendanceData, setAttendanceData] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState([]);
  const [examScores, setExamScores] = useState([]);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: p }, { data: s }, { data: b }] = await Promise.all([
          getInstituteProfile(),
          listStudents({ limit: 1 }),
          listBatches({ limit: 100 })
        ]);
        setLive({ instituteName: p.institute?.name || '', studentCount: s.pagination?.total || (s.students?.length || 0) });
        const bb = (b.batches || []).map(x => ({ id: x.batchId || x._id, name: x.name || x.batchId }));
        setBatches(bb);
        if (bb.length) setSelectedBatch(bb[0].id);
      } catch (e) {}
    };
    load();
  }, []);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const [{ data: att }, { data: pay }, { data: res }, { data: t}] = await Promise.all([
          getAttendanceStats({ range: 'week' }),
          getPaymentsSummary(),
          getResultsAnalytics(),
          listTickets({ limit: 5 })
        ]);
        const weekly = att.weekly || [];
        const avgAttendance = weekly.length ? Math.round(weekly.reduce((a, c) => a + (c.attendance || 0), 0) / weekly.length) : 0;
        const totalClasses = weekly.length;
        setCards(c => ({ ...c, totalClasses, pendingPayments: pay.pendingPayments || 0, revenueThisMonth: (pay.monthlyData || []).slice(-1)[0]?.revenue || pay.revenue || 0, avgAttendance }));
        setPaymentStatus(pay.paymentStats || []);
        setExamScores((res.distribution || []).map(d => ({ name: d.name, value: d.value })));
        setFeedback(((t.tickets || []).slice(0, 5)).map(it => ({ course: (it.category || 'general'), rating: 0, comment: it.subject })));
      } catch (e) {}
    };
    loadMetrics();
  }, []);

  useEffect(() => {
    const loadBatchSpecific = async () => {
      if (!selectedBatch) return;
      try {
        const [{ data: s }, { data: a }] = await Promise.all([
          listStudents({ batchId: selectedBatch, limit: 1 }),
          listAttendance({ batchId: selectedBatch })
        ]);
        const totalStudents = s.pagination?.total || (s.students?.length || 0);
        const logs = a.attendance || [];
        const latestDate = logs[0]?.date || null;
        const latestLogs = latestDate ? logs.filter(l => l.date === latestDate) : [];
        const present = latestLogs.filter(l => l.status === 'present').length;
        const absent = latestLogs.filter(l => l.status === 'absent').length;
        const late = latestLogs.filter(l => l.status === 'late').length;
        setCards(c => ({ ...c, totalStudents }));
        setAttendanceData([
          { name: 'Present', value: present },
          { name: 'Absent', value: absent },
          { name: 'Late', value: late },
        ]);
      } catch (e) {}
    };
    loadBatchSpecific();
  }, [selectedBatch]);

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
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            <p className="font-medium text-white text-base">{item.course}</p>
            <span className="text-sm font-medium text-gray-300">{item.comment}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const batchData = {
    totalStudents: cards.totalStudents,
    totalClasses: cards.totalClasses,
    pendingPayments: cards.pendingPayments,
    revenueThisMonth: cards.revenueThisMonth,
    avgAttendance: cards.avgAttendance,
    attendanceData,
    paymentStatus,
    examScores,
    feedback,
  };

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
                    key={batch.id}
                    className="p-3 text-white text-base font-medium cursor-pointer hover:bg-white hover:text-black hover:pl-6 transition-all duration-300"
                    onClick={() => {
                      setSelectedBatch(batch.id);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {batch.name}
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
