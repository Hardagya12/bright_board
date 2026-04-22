import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Calendar, Star, ChevronDown, TrendingUp, DollarSign, Award, BookOpen } from 'lucide-react';
import { FaChartLine, FaUserGraduate, FaMoneyBillWave, FaChalkboardTeacher } from 'react-icons/fa';
import { motion } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import Card from '../../components/ui/Card';
import { getInstituteProfile } from '../../utils/services/institute';
import { listStudents } from '../../utils/services/students';
import { listBatches } from '../../utils/services/batches';
import { getAttendanceStats, listAttendance } from '../../utils/services/attendance';
import { getPaymentsSummary } from '../../utils/services/payments';
import { getResultsAnalytics } from '../../utils/services/results';
import { listTickets } from '../../utils/services/support';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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
      } catch (e) { }
    };
    load();
  }, []);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const [{ data: att }, { data: pay }, { data: res }, { data: t }] = await Promise.all([
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
      } catch (e) { }
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
      } catch (e) { }
    };
    loadBatchSpecific();
  }, [selectedBatch]);

  const StatCard = ({ icon: Icon, value, label, isRupee, color = 'primary' }) => {
    const gradients = {
      primary: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
      success: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20',
      warning: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
      info: 'from-violet-500/20 to-violet-600/5 border-violet-500/20'
    };

    const iconColors = {
      primary: 'text-blue-400',
      success: 'text-emerald-400',
      warning: 'text-amber-400',
      info: 'text-violet-400'
    };

    return (
      <motion.div
        whileHover={{ y: -5 }}
        className={`p-6 rounded-2xl bg-gradient-to-br ${gradients[color]} border backdrop-blur-sm relative overflow-hidden group`}
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          {Icon && <Icon className="w-24 h-24" />}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg bg-white/5 ${iconColors[color]}`}>
              {isRupee ? <span className="text-2xl font-bold">₹</span> : Icon && <Icon size={24} />}
            </div>
            <span className="text-white/60 font-medium text-sm">{label}</span>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
        </div>
      </motion.div>
    );
  };

  const ChartCard = ({ title, data, children }) => (
    <Card className="h-full" variant="glass">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
        {title}
      </h3>
      <div className="h-[300px] w-full flex items-center justify-center">
        {children}
      </div>
    </Card>
  );

  const FeedbackList = ({ feedback }) => (
    <Card className="h-full" variant="glass">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
        Recent Feedback
      </h3>
      <div className="space-y-4">
        {feedback.length > 0 ? feedback.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white">{item.course}</span>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} />
                ))}
              </div>
            </div>
            <p className="text-sm text-white/60">{item.comment}</p>
          </div>
        )) : (
          <div className="text-center text-white/30 py-8">No feedback available</div>
        )}
      </div>
    </Card>
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
    <div className="flex h-screen overflow-hidden bg-transparent">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                Dashboard
              </h1>
              {live.instituteName && (
                <p className="text-white/50 flex items-center gap-2">
                  {live.instituteName}
                  <span className="w-1 h-1 rounded-full bg-white/30"></span>
                  <span className="text-blue-400">{live.studentCount} Students Active</span>
                </p>
              )}
            </div>

            <div className="relative z-20">
              <button
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all min-w-[200px] justify-between"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="text-sm font-medium truncate">
                  {batches.find(b => b.id === selectedBatch)?.name || 'Select Batch'}
                </span>
                <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-full min-w-[200px] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-50 backdrop-blur-xl">
                  {batches.map((batch) => (
                    <button
                      key={batch.id}
                      className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => {
                        setSelectedBatch(batch.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {batch.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <StatCard icon={FaUserGraduate} value={batchData.totalStudents} label="Total Students" color="primary" />
            <StatCard icon={BookOpen} value={batchData.totalClasses} label="Total Classes" color="info" />
            <StatCard
              icon={null}
              value={`${batchData.pendingPayments.toLocaleString('en-IN')}`}
              label="Pending Dues"
              isRupee={true}
              color="warning"
            />
            <StatCard
              icon={null}
              value={`${batchData.revenueThisMonth.toLocaleString('en-IN')}`}
              label="Monthly Revenue"
              isRupee={true}
              color="success"
            />
            <StatCard icon={TrendingUp} value={`${batchData.avgAttendance}%`} label="Avg. Attendance" color="primary" />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Attendance Overview" data={batchData.attendanceData}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={batchData.attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {batchData.attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Payment Status" data={batchData.paymentStatus}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={batchData.paymentStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {batchData.paymentStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Score Distribution" data={batchData.examScores}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={batchData.examScores}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {batchData.examScores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <FeedbackList feedback={batchData.feedback} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
