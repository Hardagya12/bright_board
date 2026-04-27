import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock, AlertTriangle, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../utils/api';

const MyAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, late: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [attRes, sumRes] = await Promise.all([
          api.get('/attendance/student'),
          api.get('/student/attendance/summary'),
        ]);
        setAttendance(attRes.data.attendance || []);
        setSummary(sumRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Calendar helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthStr = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getStatusForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = attendance.find(a => a.date === dateStr);
    return record?.status || null;
  };

  const statusColors = {
    present: 'bg-emerald-400',
    absent: 'bg-red-400',
    late: 'bg-amber-400',
    excused: 'bg-cyan-400',
  };

  const statusBg = {
    present: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    absent: 'bg-red-500/10 border-red-500/30 text-red-400',
    late: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    excused: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  return (
    <div className="flex h-screen overflow-hidden bg-[#f9faf6] font-body relative">
      <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
            
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-[#e8ebe6] scrollbar-track-transparent relative z-10">
        <div className="max-w-7xl mx-auto space-y-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#0e0f0c] font-display tracking-tight mb-2">My Attendance</h1>
            <p className="text-[#868685] tracking-wide mt-2">Track your class attendance and regularity.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-[24px] bg-white" />)}
            </div>
          ) : (
            <>
              {/* Low Attendance Warning */}
              {summary.percentage < 75 && summary.total > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-[20px] bg-red-500/10 border border-red-500/30 flex items-center gap-4 shadow-[0_0_15px_rgba(248,113,113,0.15)]"
                >
                  <AlertTriangle className="text-red-400 shrink-0" size={24} />
                  <p className="text-red-400 text-sm font-bold tracking-wide">
                    Your attendance is {summary.percentage}%. Minimum required is 75%. Please attend more classes.
                  </p>
                </motion.div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {[
                  { label: 'Total Classes', value: summary.total, icon: Calendar, color: 'text-blue-400', accent: 'cyan' },
                  { label: 'Present', value: summary.present, icon: CheckCircle, color: 'text-emerald-400', accent: 'green' },
                  { label: 'Absent', value: summary.absent, icon: XCircle, color: 'text-red-400', accent: 'pink' },
                  { label: 'Late', value: summary.late, icon: Clock, color: 'text-amber-400', accent: 'amber' },
                  { label: 'Percentage', value: `${summary.percentage}%`, icon: CheckCircle, color: 'text-cyan-400', accent: 'purple' },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className={`bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 accent-top-${stat.accent}`}>
                      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity ${stat.color}`}>
                        <stat.icon size={50} className="transform rotate-12" />
                      </div>
                      <p className="text-[#868685] text-[10px] font-bold uppercase tracking-widest mb-2 relative z-10">{stat.label}</p>
                      <p className={`text-3xl font-bold font-display tracking-tight drop-shadow-md relative z-10 ${stat.color}`}>{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar */}
                <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-8 lg:col-span-2 accent-top-cyan">
                  <div className="flex items-center justify-between mb-8">
                    <button onClick={prevMonth} className="p-3 bg-white hover:bg-[#e2f6d5] border border-[#e8ebe6] rounded-[12px] text-[#868685] hover:text-[#0e0f0c] transition-all shadow-inner">
                      <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-2xl font-bold text-[#0e0f0c] font-display tracking-tight">{monthStr}</h2>
                    <button onClick={nextMonth} className="p-3 bg-white hover:bg-[#e2f6d5] border border-[#e8ebe6] rounded-[12px] text-[#868685] hover:text-[#0e0f0c] transition-all shadow-inner">
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="text-center text-xs font-bold text-[#868685] uppercase tracking-widest py-2">{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const status = getStatusForDate(day);
                      const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
                          className={`aspect-square rounded-[16px] flex flex-col items-center justify-center text-sm font-bold transition-all duration-300 relative
                            ${isToday ? 'ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.3)]' : ''}
                            ${status ? statusBg[status] + ' shadow-inner' : 'bg-white border border-[#e8ebe6] hover:bg-white hover:border-[#e8ebe6] text-[#868685] shadow-inner'}
                            ${selectedDate === dateStr ? 'scale-95 ring-2 ring-white shadow-lg' : ''}
                          `}
                        >
                          <span className={`${status ? 'drop-shadow-md' : ''}`}>{day}</span>
                          {status && <div className={`absolute bottom-2 w-2 h-2 rounded-full bg-${statusColors[status].split('-')[1]}-400 shadow-[0_0_8px_currentColor]`} />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-[#e8ebe6]">
                    {[
                      { color: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]', label: 'Present' },
                      { color: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]', label: 'Absent' },
                      { color: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]', label: 'Late' },
                      { color: 'bg-white/20 border border-white/40', label: 'No class' },
                    ].map(l => (
                      <div key={l.label} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#868685]">
                        <div className={`w-3 h-3 rounded-full ${l.color}`} /> {l.label}
                      </div>
                    ))}
                  </div>

                  {/* Selected Date Detail */}
                  {selectedDate && (() => {
                    const record = attendance.find(a => a.date === selectedDate);
                    return (
                      <motion.div initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
                        className="mt-6 p-6 rounded-[20px] bg-white/[0.03] border border-[#e8ebe6] shadow-inner overflow-hidden"
                      >
                        <p className="text-[#0e0f0c] font-bold tracking-wide">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        {record ? (
                          <div className="flex items-center gap-4 mt-4">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border shadow-inner ${
                              record.status === 'present' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                              record.status === 'absent' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                              record.status === 'late' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                              'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                            }`}>{record.status}</span>
                            {record.reason && <span className="text-[#868685] text-sm font-medium">{record.reason}</span>}
                          </div>
                        ) : (
                          <p className="text-[#868685] text-sm font-medium tracking-wide mt-2">No record for this date.</p>
                        )}
                      </motion.div>
                    );
                  })()}
                </div>

                {/* Attendance List */}
                <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm overflow-hidden accent-top-purple flex flex-col h-full">
                  <div className="p-8 border-b border-[#e8ebe6]">
                    <h3 className="text-xl font-bold text-[#0e0f0c] font-display tracking-tight">History Log</h3>
                  </div>
                  <div className="divide-y divide-white/5 overflow-y-auto custom-scrollbar flex-1">
                    {attendance.length === 0 ? (
                      <div className="p-8 text-center text-[#868685] font-medium tracking-wide">No attendance records found.</div>
                    ) : (
                      [...attendance].reverse().map((a, i) => (
                        <div key={i} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                          <div className="flex items-center gap-5">
                            <div className={`w-3 h-10 rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] bg-${a.status === 'present' ? 'emerald' : a.status === 'absent' ? 'red' : a.status === 'late' ? 'amber' : 'cyan'}-400`} />
                            <div>
                              <p className="text-[#0e0f0c] font-bold tracking-wide group-hover:text-cyan-400 transition-colors">
                                {new Date(a.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                              {a.reason && <p className="text-[#868685] text-xs font-medium mt-1">{a.reason}</p>}
                            </div>
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-inner ${
                            a.status === 'present' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                            a.status === 'absent' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                            a.status === 'late' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                            'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                          }`}>{a.status}</span>
                        </div>
                      ))
                    )}
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

export default MyAttendance;
