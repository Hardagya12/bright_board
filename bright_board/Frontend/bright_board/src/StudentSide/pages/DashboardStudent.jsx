import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Percent, Bell, Book, Calendar, ArrowRight, Clock, CreditCard, FileText, BarChart2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../utils/api';
import { 
  BookSVG, PencilSVG, StarSVG, LightbulbSVG, 
  GradCapSVG, SparklesSVG, SchoolBellSVG, BackpackSVG 
} from '../../components/svg/SchoolIllustrations';

const DashboardStudent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: d } = await api.get('/student/dashboard');
        setData(d);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = data?.stats || {};
  const upcomingExams = data?.upcomingExams || [];
  const recentMaterials = data?.recentMaterials || [];
  const attendanceByDate = data?.attendanceByDate || [];

  // Mini calendar helper for current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const getAttStatus = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = attendanceByDate.find(a => a.date === dateStr);
    return record?.status || null;
  };

  const statusDot = { 
    present: 'bg-[#054d28]', 
    absent: 'bg-[#d03238]', 
    late: 'bg-[#ffd11a]', 
    excused: 'bg-[#38c8ff]' 
  };

  const StatCard = ({ title, value, icon: Icon, colorBg, colorText, subtext }) => (
    <div className="bb-card p-5 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300">
      <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity duration-500`}>
        <Icon size={60} className={colorText} />
      </div>
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-full ${colorBg} flex items-center justify-center mb-4 ${colorText}`}>
          <Icon size={22} />
        </div>
        <h3 className="text-[#868685] text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
        <div className="text-3xl font-display text-[#0e0f0c] mb-1">{value}</div>
        {subtext && <p className="text-[#868685] text-[11px]">{subtext}</p>}
      </div>
    </div>
  );

  const typeIcons = { pdf: '📄', doc: '📝', video: '🎬', image: '🖼️', file: '📁' };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f9faf6] relative font-body">
      <Sidebar />

      {/* Floating illustrations */}
      <div className="absolute top-8 right-8 opacity-15 pointer-events-none z-0">
        <BookSVG size={80} />
      </div>
      <div className="absolute bottom-8 right-12 opacity-10 pointer-events-none z-0">
        <PencilSVG size={60} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-10">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
            <div>
              <h1 className="text-4xl md:text-5xl font-display text-[#0e0f0c] tracking-tight mb-2">
                Student Dashboard
              </h1>
              <p className="text-[#868685] text-sm mt-2 font-medium">Welcome back! Here's an overview of your academic progress.</p>
            </div>
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full border border-[#e8ebe6] shadow-ring">
              <Clock size={16} className="text-[#163300]" />
              <span className="text-[#0e0f0c] font-semibold text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {error && (
            <div className="p-5 rounded-[20px] bg-[#ffeaea] border border-[#d03238]/20 text-[#d03238] font-semibold">{error}</div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-40 rounded-[30px] bg-[#e8ebe6]" />)}
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <StatCard title="Attendance" value={`${stats.attendancePercentage || 0}%`} icon={Percent} colorBg="bg-[#e2f6d5]" colorText="text-[#163300]" subtext={`${stats.classesAttended || 0}/${stats.totalClasses || 0} classes`} />
                <StatCard title="Pending Fees" value={`₹${(stats.pendingFees || 0).toLocaleString()}`} icon={CreditCard} colorBg="bg-[#fff8e0]" colorText="text-[#8a6d00]" subtext={stats.pendingFees > 0 ? 'Due payment' : 'All clear!'} />
                <StatCard title="Exams" value={stats.examsAttempted || 0} icon={Book} colorBg="bg-[#f0e6ff]" colorText="text-[#6b21a8]" subtext={`${stats.upcomingExamsCount || 0} upcoming`} />
                <StatCard title="Avg Score" value={`${stats.averageScore || 0}%`} icon={BarChart2} colorBg="bg-[#e8f4ff]" colorText="text-[#0066cc]" subtext="Across all exams" />
                <StatCard title="Materials" value={stats.materialsAvailable || 0} icon={FileText} colorBg="bg-[#ffe8d9]" colorText="text-[#c2410c]" subtext={`${stats.newMaterialsThisWeek || 0} new this week`} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Exams */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-display text-[#0e0f0c] flex items-center gap-3">
                      <Calendar className="text-[#163300]" size={22} /> Upcoming Exams
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/s/exams')}>View All</Button>
                  </div>

                  <div className="space-y-4">
                    {upcomingExams.length === 0 ? (
                      <div className="bb-card p-10 text-center border-dashed border-2 border-[#e8ebe6]">
                        <div className="mb-4"><GradCapSVG size={60} className="mx-auto" /></div>
                        <p className="text-[#868685] font-medium">No upcoming exams scheduled.</p>
                      </div>
                    ) : (
                      upcomingExams.map((exam, idx) => {
                        const isLive = exam.status === 'live';
                        return (
                          <motion.div key={exam.id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                            <div className={`bb-card p-6 flex flex-col md:flex-row items-center justify-between gap-5 transition-all duration-300 hover:shadow-card-hover ${isLive ? 'border-l-4 border-l-[#9fe870]' : ''}`}>
                              <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-[16px] flex items-center justify-center border ${isLive ? 'bg-[#e2f6d5] text-[#163300] border-[#9fe870]/30' : 'bg-[#f0e6ff] text-[#6b21a8] border-[#6b21a8]/20'}`}>
                                  {isLive ? <Zap size={24} /> : <Book size={24} />}
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg text-[#0e0f0c]">{exam.title}</h3>
                                  <p className="text-[#868685] text-xs flex items-center gap-4 mt-2 font-medium">
                                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {exam.scheduledDate ? new Date(exam.scheduledDate).toLocaleDateString() : 'TBD'}</span>
                                    <span className="flex items-center gap-1.5"><Clock size={14} /> {exam.durationMinutes} MIN</span>
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 w-full md:w-auto">
                                {isLive && (
                                  <span className="badge-green">
                                    <span className="w-2 h-2 bg-[#054d28] rounded-full animate-pulse" /> LIVE
                                  </span>
                                )}
                                <Button
                                  variant={isLive ? 'primary' : 'secondary'}
                                  onClick={() => navigate(isLive ? `/s/exam/${exam.id}` : '/s/exams')}
                                  className="w-full md:w-auto text-sm"
                                >
                                  {isLive ? 'Attempt Now' : 'View Details'} <ArrowRight size={14} />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>

                  {/* Recent Study Materials */}
                  <div className="pt-8">
                    <div className="flex items-center justify-between mb-6 px-2">
                      <h2 className="text-2xl font-display text-[#0e0f0c] flex items-center gap-3">
                        <Book className="text-[#6b21a8]" size={22} /> Recent Materials
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => navigate('/s/materials')}>View All</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {recentMaterials.length === 0 ? (
                        <div className="bb-card p-8 text-center text-[#868685] text-sm col-span-2 border-dashed border-2 border-[#e8ebe6]">
                          <LightbulbSVG size={50} className="mx-auto mb-3" />
                          No materials available.
                        </div>
                      ) : (
                        recentMaterials.map((mat, i) => (
                          <div key={mat.id || i} className="bb-card p-5 flex items-center justify-between hover:shadow-card-hover transition-all cursor-pointer group" onClick={() => navigate('/s/materials')}>
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-[16px] bg-[#f0e6ff] border border-[#6b21a8]/10 text-[#6b21a8] flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                                {typeIcons[mat.type] || '📁'}
                              </div>
                              <div>
                                <h4 className="text-[#0e0f0c] font-bold text-[14px] group-hover:text-[#163300] transition-colors">{mat.name}</h4>
                                <p className="text-[#868685] text-xs mt-1 font-medium">{mat.subject || 'GENERAL'} • {mat.type?.toUpperCase()}</p>
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-[#e2f6d5] flex items-center justify-center group-hover:bg-[#9fe870] transition-all">
                              <ArrowRight size={14} className="text-[#163300]" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Mini Attendance Calendar */}
                  <div>
                    <h2 className="text-2xl font-display text-[#0e0f0c] mb-6 px-2 flex items-center gap-3">
                      <Calendar className="text-[#054d28]" size={22} /> This Month
                    </h2>
                    <div className="bb-card p-6">
                      <div className="absolute top-0 left-[10%] right-[10%] h-[3px] rounded-b-full bg-[#9fe870]" />
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {['S','M','T','W','T','F','S'].map((d, i) => (
                          <div key={i} className="text-center text-xs text-[#868685] font-bold py-1">{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="aspect-square" />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const status = getAttStatus(day);
                          const isToday = now.getDate() === day;
                          return (
                            <div key={day} className={`aspect-square rounded-full flex flex-col items-center justify-center relative transition-all ${isToday ? 'bg-[#9fe870] text-[#163300] font-bold shadow-sm' : 'bg-[#f9faf6] hover:bg-[#e2f6d5]'}`}>
                              <span className={`${status || isToday ? 'text-[#0e0f0c] font-bold' : 'text-[#868685]'} text-xs`}>{day}</span>
                              {status && <div className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${statusDot[status] || 'bg-[#868685]'}`} />}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex gap-4 mt-6 pt-5 border-t border-[#e8ebe6] justify-center">
                        {[{ c: 'bg-[#054d28]', l: 'Present' }, { c: 'bg-[#d03238]', l: 'Absent' }, { c: 'bg-[#ffd11a]', l: 'Late' }].map(x => (
                          <div key={x.l} className="flex items-center gap-2 text-[10px] text-[#868685] font-semibold">
                            <div className={`w-2 h-2 rounded-full ${x.c}`} /> {x.l}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h2 className="text-2xl font-display text-[#0e0f0c] mb-6 px-2">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: Book, label: 'Exams', to: '/s/exams', bg: 'bg-[#f0e6ff]', color: 'text-[#6b21a8]', hoverBg: 'hover:bg-[#e4d5ff]' },
                        { icon: FileText, label: 'Materials', to: '/s/materials', bg: 'bg-[#e8f4ff]', color: 'text-[#0066cc]', hoverBg: 'hover:bg-[#d0e8ff]' },
                        { icon: Check, label: 'Attendance', to: '/s/attendance', bg: 'bg-[#e2f6d5]', color: 'text-[#163300]', hoverBg: 'hover:bg-[#cdffad]' },
                        { icon: Bell, label: 'Feedback', to: '/s/feedback', bg: 'bg-[#fff8e0]', color: 'text-[#8a6d00]', hoverBg: 'hover:bg-[#ffd11a]/30' },
                      ].map((action, i) => (
                        <button
                          key={i}
                          onClick={() => navigate(action.to)}
                          className={`p-5 ${action.bg} border border-[#e8ebe6] rounded-[20px] transition-all duration-300 flex flex-col items-center gap-3 ${action.hoverBg} group cursor-pointer hover:scale-[1.03] hover:shadow-md`}
                        >
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <action.icon size={22} className={action.color} />
                          </div>
                          <span className="text-[#0e0f0c] font-bold text-sm">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardStudent;