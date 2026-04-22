import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Percent, Bell, Book, Calendar, ArrowRight, Clock, CreditCard, FileText, BarChart2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../utils/api';

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

  const statusDot = { present: 'bg-emerald-500', absent: 'bg-red-500', late: 'bg-amber-500', excused: 'bg-blue-500' };

  const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <Card variant="glass" className="p-5 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
      <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
        <Icon size={60} />
      </div>
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-xl ${color.replace('text-', 'bg-')}/10 flex items-center justify-center mb-3 ${color}`}>
          <Icon size={20} />
        </div>
        <h3 className="text-white/60 text-[11px] font-medium uppercase tracking-wider mb-1">{title}</h3>
        <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
        {subtext && <p className="text-white/40 text-[11px]">{subtext}</p>}
      </div>
    </Card>
  );

  const typeIcons = { pdf: '📄', doc: '📝', video: '🎬', image: '🖼️', file: '📁' };

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Student Dashboard</h1>
              <p className="text-white/50">Welcome back! Here's an overview of your academic progress.</p>
            </div>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Clock size={16} className="text-blue-400" />
              <span className="text-white/80 text-sm font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">{error}</div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-32 rounded-2xl bg-white/5" />)}
            </div>
          ) : (
            <>
              {/* Stats Grid — 5 cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard title="Attendance" value={`${stats.attendancePercentage || 0}%`} icon={Percent} color="text-emerald-400"
                  subtext={`${stats.classesAttended || 0}/${stats.totalClasses || 0} classes`} />
                <StatCard title="Pending Fees" value={`₹${(stats.pendingFees || 0).toLocaleString()}`} icon={CreditCard} color="text-amber-400"
                  subtext={stats.pendingFees > 0 ? 'Due payment' : 'All clear!'} />
                <StatCard title="Exams" value={stats.examsAttempted || 0} icon={Book} color="text-purple-400"
                  subtext={`${stats.upcomingExamsCount || 0} upcoming`} />
                <StatCard title="Avg Score" value={`${stats.averageScore || 0}%`} icon={BarChart2} color="text-blue-400"
                  subtext="Across all exams" />
                <StatCard title="Materials" value={stats.materialsAvailable || 0} icon={FileText} color="text-teal-400"
                  subtext={`${stats.newMaterialsThisWeek || 0} new this week`} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Exams */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Calendar className="text-blue-400" size={20} /> Upcoming Exams
                    </h2>
                    <Button variant="ghost" size="sm" className="text-white/50 hover:text-white" onClick={() => navigate('/s/exams')}>View All</Button>
                  </div>

                  <div className="space-y-3">
                    {upcomingExams.length === 0 ? (
                      <Card variant="glass" className="p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                          <Book size={24} className="text-white/20" />
                        </div>
                        <p className="text-white/40">No upcoming exams scheduled.</p>
                      </Card>
                    ) : (
                      upcomingExams.map((exam, idx) => {
                        const isLive = exam.status === 'live';
                        return (
                          <motion.div key={exam.id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                            <Card variant="glass" className={`p-4 flex flex-col md:flex-row items-center justify-between gap-4 group hover:bg-white/5 transition-colors ${isLive ? 'ring-1 ring-emerald-500/40' : ''}`}>
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                  {isLive ? <Zap size={20} /> : <Book size={20} />}
                                </div>
                                <div>
                                  <h3 className="font-bold text-white">{exam.title}</h3>
                                  <p className="text-white/40 text-xs flex items-center gap-2">
                                    <Calendar size={12} />
                                    {exam.scheduledDate ? new Date(exam.scheduledDate).toLocaleDateString() : 'Date TBD'}
                                    <Clock size={12} className="ml-2" /> {exam.durationMinutes} min
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {isLive && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> LIVE
                                  </span>
                                )}
                                <Button
                                  variant={isLive ? 'accent' : 'outline'}
                                  onClick={() => navigate(isLive ? `/s/exam/${exam.id}` : '/s/exams')}
                                  className="w-full md:w-auto text-sm"
                                >
                                  {isLive ? 'Attempt Now' : 'View'} <ArrowRight size={14} className="ml-1" />
                                </Button>
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })
                    )}
                  </div>

                  {/* Recent Study Materials */}
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Book className="text-emerald-400" size={20} /> Recent Materials
                      </h2>
                      <Button variant="ghost" size="sm" className="text-white/50 hover:text-white" onClick={() => navigate('/s/materials')}>View All</Button>
                    </div>
                    <div className="space-y-2">
                      {recentMaterials.length === 0 ? (
                        <Card variant="glass" className="p-6 text-center text-white/40 text-sm">No materials available.</Card>
                      ) : (
                        recentMaterials.map((mat, i) => (
                          <Card key={mat.id || i} variant="glass" className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('/s/materials')}>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-sm">
                                {typeIcons[mat.type] || '📁'}
                              </div>
                              <div>
                                <h4 className="text-white font-medium text-sm">{mat.name}</h4>
                                <p className="text-white/30 text-[10px]">{mat.subject || 'General'} • {mat.type?.toUpperCase()}</p>
                              </div>
                            </div>
                            <ArrowRight size={14} className="text-white/20" />
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Mini Attendance Calendar */}
                  <div>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Calendar className="text-emerald-400" size={18} /> This Month
                    </h2>
                    <Card variant="glass" className="p-4">
                      <div className="grid grid-cols-7 gap-1 mb-1">
                        {['S','M','T','W','T','F','S'].map((d, i) => (
                          <div key={i} className="text-center text-[10px] text-white/30 font-medium py-1">{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="aspect-square" />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const status = getAttStatus(day);
                          const isToday = now.getDate() === day;
                          return (
                            <div key={day} className={`aspect-square rounded flex items-center justify-center text-[10px] relative ${isToday ? 'ring-1 ring-cyan-500/50' : ''}`}>
                              <span className={`${status ? 'text-white' : 'text-white/40'} font-medium`}>{day}</span>
                              {status && <div className={`absolute bottom-0.5 w-1 h-1 rounded-full ${statusDot[status] || 'bg-white/20'}`} />}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex gap-3 mt-3 pt-3 border-t border-white/10">
                        {[{ c: 'bg-emerald-500', l: 'P' }, { c: 'bg-red-500', l: 'A' }, { c: 'bg-amber-500', l: 'L' }].map(x => (
                          <div key={x.l} className="flex items-center gap-1 text-[10px] text-white/40">
                            <div className={`w-2 h-2 rounded-full ${x.c}`} /> {x.l}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { icon: Book, label: 'Exams', to: '/s/exams', color: 'text-purple-400' },
                        { icon: FileText, label: 'Materials', to: '/s/materials', color: 'text-cyan-400' },
                        { icon: Check, label: 'Attendance', to: '/s/attendance', color: 'text-emerald-400' },
                        { icon: Bell, label: 'Feedback', to: '/s/feedback', color: 'text-amber-400' },
                      ].map((action, i) => (
                        <button
                          key={i}
                          onClick={() => navigate(action.to)}
                          className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors flex flex-col items-center gap-2"
                        >
                          <action.icon size={20} className={action.color} />
                          <span className="text-white/70 text-xs font-medium">{action.label}</span>
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