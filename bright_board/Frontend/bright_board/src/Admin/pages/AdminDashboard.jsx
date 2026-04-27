import React, { useEffect, useState } from 'react';
import ReusablePieChart from '../components/charts/ReusablePieChart';
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
import { BookSVG, GradCapSVG, StarSVG, ChalkboardSVG, SparklesSVG } from '../../components/svg/SchoolIllustrations';



// ─── Sub-components at module level to prevent remounts ───
const StatCard = ({ icon: Icon, value, label, isRupee, colorBg, colorText }) => (
  <Card hover={true} accentColor="green" className="relative group p-0">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${colorText}`}>
      {Icon && <Icon className="w-20 h-20" />}
    </div>
    <div className="relative z-10 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2.5 rounded-full ${colorBg} ${colorText}`}>
          {isRupee ? <span className="text-xl font-bold">₹</span> : Icon && <Icon size={22} />}
        </div>
        <span className="text-[#868685] font-semibold text-sm">{label}</span>
      </div>
      <div className="text-4xl font-display text-[#0e0f0c] tracking-tight">{value}</div>
    </div>
  </Card>
);

const ChartCard = ({ title, children, accent = 'green' }) => (
  <Card title={title} hover={false} accentColor={accent} className="h-full">
    <div className="h-[300px] w-full flex items-center justify-center relative z-10">
      {children}
    </div>
  </Card>
);

const FeedbackList = ({ feedback: feedbackItems }) => (
  <Card title="Recent Feedback" hover={false} accentColor="orange" className="h-full">
    <div className="space-y-4 relative z-10">
      {feedbackItems.length > 0 ? feedbackItems.map((item, index) => (
        <div
          key={index}
          className="p-5 rounded-[20px] bg-[#f9faf6] border border-[#e8ebe6] hover:bg-[#e2f6d5] transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[#0e0f0c] group-hover:text-[#163300] transition-colors">{item.course}</span>
            <div className="flex text-[#ffd11a]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} />
              ))}
            </div>
          </div>
          <p className="text-sm text-[#454745] font-hand text-lg leading-tight">{item.comment}</p>
        </div>
      )) : (
        <div className="text-center py-8">
          <StarSVG size={50} className="mx-auto mb-3" />
          <p className="text-[#868685] font-medium">No feedback available</p>
        </div>
      )}
    </div>
  </Card>
);

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [{ data: p }, { data: s }, { data: b }, { data: att }, { data: pay }, { data: res }, { data: t }] = await Promise.all([
          getInstituteProfile(),
          listStudents({ limit: 1 }),
          listBatches({ limit: 100 }),
          getAttendanceStats({ range: 'week' }).catch(() => ({ data: { weekly: [] } })),
          getPaymentsSummary().catch(() => ({ data: {} })),
          getResultsAnalytics().catch(() => ({ data: {} })),
          listTickets({ limit: 5 }).catch(() => ({ data: { tickets: [] } })),
        ]);
        if (cancelled) return;

        // Profile + batches
        setLive({ instituteName: p.institute?.name || '', studentCount: s.pagination?.total || (s.students?.length || 0) });
        const bb = (b.batches || []).map(x => ({ id: x.batchId || x._id, name: x.name || x.batchId }));
        setBatches(bb);

        // Metrics
        const weekly = att.weekly || [];
        const avgAttendance = weekly.length ? Math.round(weekly.reduce((a, c) => a + (c.attendance || 0), 0) / weekly.length) : 0;
        const totalClasses = weekly.length;
        setCards(c => ({ ...c, totalClasses, pendingPayments: pay.pendingPayments || 0, revenueThisMonth: (pay.monthlyData || []).slice(-1)[0]?.revenue || pay.revenue || 0, avgAttendance }));
        setPaymentStatus(pay.paymentStats || []);
        setExamScores((res.distribution || []).map(d => ({ name: d.name, value: d.value })));
        setFeedback(((t.tickets || []).slice(0, 5)).map(it => ({ course: (it.category || 'general'), rating: 0, comment: it.subject })));

        // Trigger batch-specific load
        if (bb.length) setSelectedBatch(bb[0].id);
      } catch (e) { } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadBatchSpecific = async () => {
      if (!selectedBatch) return;
      try {
        const [{ data: s }, { data: a }] = await Promise.all([
          listStudents({ batchId: selectedBatch, limit: 1 }),
          listAttendance({ batchId: selectedBatch })
        ]);
        if (cancelled) return;
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
    return () => { cancelled = true; };
  }, [selectedBatch]);

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
    <div className="flex h-screen overflow-hidden bg-[#f9faf6] relative">
      <AdminSidebar />
      
      {/* Floating illustrations */}
      <div className="absolute top-8 right-8 opacity-10 pointer-events-none z-0">
        <ChalkboardSVG size={100} />
      </div>
      <div className="absolute bottom-8 right-12 opacity-8 pointer-events-none z-0">
        <GradCapSVG size={60} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
            <div>
              <h1 className="text-5xl font-display text-[#0e0f0c] tracking-tight mb-2 relative inline-block">
                Dashboard
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                  <path d="M2 5 Q50 1 100 5 Q150 9 198 3" stroke="#9fe870" strokeWidth="4" strokeLinecap="round" fill="none" />
                </svg>
              </h1>
              {live.instituteName && (
                <p className="text-[#868685] flex items-center gap-2 mt-4 text-sm font-medium">
                  {live.instituteName}
                  <span className="w-2 h-2 rounded-full bg-[#9fe870] animate-pulse" />
                  <span className="text-[#163300] font-bold">{live.studentCount} Active Students</span>
                </p>
              )}
            </div>

            <div className="relative z-30">
              <button
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-[#e8ebe6] text-[#0e0f0c] hover:bg-[#e2f6d5] hover:border-[#9fe870] transition-all min-w-[200px] justify-between shadow-ring"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="text-sm font-bold truncate">
                  {batches.find(b => b.id === selectedBatch)?.name || 'Select Batch'}
                </span>
                <ChevronDown className={`w-4 h-4 text-[#163300] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-3 w-full min-w-[200px] bg-white border border-[#e8ebe6] rounded-[20px] shadow-card overflow-hidden py-2 z-50">
                  {batches.map((batch) => (
                    <button
                      key={batch.id}
                      className="w-full text-left px-5 py-3 text-sm font-semibold text-[#454745] hover:text-[#163300] hover:bg-[#e2f6d5] transition-colors"
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
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bb-card p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#e8ebe6]" />
                    <div className="h-3 w-20 rounded-full bg-[#e8ebe6]" />
                  </div>
                  <div className="h-8 w-16 rounded-full bg-[#e8ebe6]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <StatCard icon={FaUserGraduate} value={batchData.totalStudents} label="Total Students" colorBg="bg-[#e2f6d5]" colorText="text-[#163300]" />
              <StatCard icon={BookOpen} value={batchData.totalClasses} label="Total Classes" colorBg="bg-[#f0e6ff]" colorText="text-[#6b21a8]" />
              <StatCard icon={null} value={`${batchData.pendingPayments.toLocaleString('en-IN')}`} label="Pending Dues" isRupee={true} colorBg="bg-[#fff8e0]" colorText="text-[#8a6d00]" />
              <StatCard icon={null} value={`${batchData.revenueThisMonth.toLocaleString('en-IN')}`} label="Monthly Revenue" isRupee={true} colorBg="bg-[#e2f6d5]" colorText="text-[#054d28]" />
              <StatCard icon={TrendingUp} value={`${batchData.avgAttendance}%`} label="Avg. Attendance" colorBg="bg-[#ffe8d9]" colorText="text-[#c2410c]" />
            </div>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartCard title="Attendance Overview" data={batchData.attendanceData} accent="green">
              <ReusablePieChart data={batchData.attendanceData} />
            </ChartCard>

            <ChartCard title="Payment Status" data={batchData.paymentStatus} accent="yellow">
              <ReusablePieChart data={batchData.paymentStatus} />
            </ChartCard>

            <ChartCard title="Score Distribution" data={batchData.examScores} accent="orange">
              <ReusablePieChart data={batchData.examScores} />
            </ChartCard>

            <FeedbackList feedback={batchData.feedback} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
