import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock, AlertTriangle, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Card from '../../components/ui/Card';
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
    present: 'bg-emerald-500',
    absent: 'bg-red-500',
    late: 'bg-amber-500',
    excused: 'bg-blue-500',
  };

  const statusBg = {
    present: 'bg-emerald-500/20 border-emerald-500/30',
    absent: 'bg-red-500/20 border-red-500/30',
    late: 'bg-amber-500/20 border-amber-500/30',
    excused: 'bg-blue-500/20 border-blue-500/30',
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">My Attendance</h1>
            <p className="text-white/50">Track your class attendance and regularity.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl bg-white/5" />)}
            </div>
          ) : (
            <>
              {/* Low Attendance Warning */}
              {summary.percentage < 75 && summary.total > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
                >
                  <AlertTriangle className="text-red-400 shrink-0" size={20} />
                  <p className="text-red-400 text-sm font-medium">
                    Your attendance is {summary.percentage}%. Minimum required is 75%. Please attend more classes.
                  </p>
                </motion.div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Total Classes', value: summary.total, icon: Calendar, color: 'text-blue-400' },
                  { label: 'Present', value: summary.present, icon: CheckCircle, color: 'text-emerald-400' },
                  { label: 'Absent', value: summary.absent, icon: XCircle, color: 'text-red-400' },
                  { label: 'Late', value: summary.late, icon: Clock, color: 'text-amber-400' },
                  { label: 'Percentage', value: `${summary.percentage}%`, icon: CheckCircle, color: 'text-cyan-400' },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card variant="glass" className="p-5 relative overflow-hidden group">
                      <div className={`absolute top-0 right-0 p-3 opacity-10 ${stat.color}`}>
                        <stat.icon size={50} />
                      </div>
                      <p className="text-white/50 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Calendar */}
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg text-white/60 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-lg font-bold text-white">{monthStr}</h2>
                  <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg text-white/60 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-center text-xs text-white/30 font-medium py-2">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
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
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative
                          ${isToday ? 'ring-2 ring-cyan-500/50' : ''}
                          ${status ? statusBg[status] + ' border' : 'hover:bg-white/5'}
                          ${selectedDate === dateStr ? 'ring-2 ring-white/50' : ''}
                        `}
                      >
                        <span className={`font-medium ${status ? 'text-white' : 'text-white/60'}`}>{day}</span>
                        {status && <div className={`w-1.5 h-1.5 rounded-full ${statusColors[status]} mt-0.5`} />}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-white/10">
                  {[
                    { color: 'bg-emerald-500', label: 'Present' },
                    { color: 'bg-red-500', label: 'Absent' },
                    { color: 'bg-amber-500', label: 'Late' },
                    { color: 'bg-white/20', label: 'No class' },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-2 text-xs text-white/50">
                      <div className={`w-3 h-3 rounded ${l.color}`} /> {l.label}
                    </div>
                  ))}
                </div>

                {/* Selected Date Detail */}
                {selectedDate && (() => {
                  const record = attendance.find(a => a.date === selectedDate);
                  return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <p className="text-white font-medium">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      {record ? (
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                            record.status === 'present' ? 'bg-emerald-500/20 text-emerald-400' :
                            record.status === 'absent' ? 'bg-red-500/20 text-red-400' :
                            record.status === 'late' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>{record.status}</span>
                          {record.reason && <span className="text-white/40 text-sm">{record.reason}</span>}
                        </div>
                      ) : (
                        <p className="text-white/40 text-sm mt-1">No record for this date</p>
                      )}
                    </motion.div>
                  );
                })()}
              </Card>

              {/* Attendance List */}
              <Card variant="glass" className="overflow-hidden">
                <div className="p-5 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white">Attendance History</h3>
                </div>
                <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                  {attendance.length === 0 ? (
                    <div className="p-8 text-center text-white/40">No attendance records found.</div>
                  ) : (
                    [...attendance].reverse().map((a, i) => (
                      <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-8 rounded-full ${statusColors[a.status] || 'bg-white/20'}`} />
                          <div>
                            <p className="text-white font-medium text-sm">
                              {new Date(a.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            {a.reason && <p className="text-white/40 text-xs">{a.reason}</p>}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                          a.status === 'present' ? 'bg-emerald-500/20 text-emerald-400' :
                          a.status === 'absent' ? 'bg-red-500/20 text-red-400' :
                          a.status === 'late' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>{a.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;
