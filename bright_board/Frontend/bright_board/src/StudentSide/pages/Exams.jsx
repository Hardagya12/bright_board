import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Calendar, Clock, ArrowRight, AlertCircle, Zap, CheckCircle, XCircle, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { listExamsStudent } from '../../utils/services/exams';

const tabs = ['live', 'upcoming', 'completed', 'missed'];

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await listExamsStudent();
        setExams(data.exams || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categorize = (exam) => {
    const status = exam.status || (exam.published ? 'live' : 'draft');
    if (exam.attempted) return 'completed';
    if (status === 'live') return 'live';
    if (status === 'scheduled') return 'upcoming';
    if (status === 'ended' && !exam.attempted) return 'missed';
    // Legacy fallback
    if (exam.published && !exam.attempted) return 'upcoming';
    return 'upcoming';
  };

  const categorized = {
    live: exams.filter(e => categorize(e) === 'live'),
    upcoming: exams.filter(e => categorize(e) === 'upcoming'),
    completed: exams.filter(e => categorize(e) === 'completed'),
    missed: exams.filter(e => categorize(e) === 'missed'),
  };

  const currentExams = categorized[activeTab] || [];
  const liveCount = categorized.live.length;

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto space-y-8">

          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">My Exams</h1>
            <p className="text-white/50">View, attempt, and track your examinations.</p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 bg-white/5 rounded-xl p-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium capitalize transition-all relative ${
                  activeTab === tab
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {tab === 'live' && liveCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white animate-pulse">
                    {liveCount}
                  </span>
                )}
                {tab} ({categorized[tab].length})
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-2xl bg-white/5" />)}
            </div>
          ) : currentExams.length === 0 ? (
            <Card variant="glass" className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-white/20">
                <Book size={40} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {activeTab === 'live' ? 'No Live Exams' :
                 activeTab === 'upcoming' ? 'No Upcoming Exams' :
                 activeTab === 'completed' ? 'No Completed Exams' :
                 'No Missed Exams'}
              </h3>
              <p className="text-white/40">
                {activeTab === 'live' ? 'No exams are currently live.' :
                 activeTab === 'upcoming' ? 'No exams scheduled. Check back later.' :
                 activeTab === 'completed' ? 'You haven\'t completed any exams yet.' :
                 'You haven\'t missed any exams. Great job!'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentExams.map((exam, idx) => {
                const isLive = categorize(exam) === 'live';
                const isCompleted = categorize(exam) === 'completed';
                const isMissed = categorize(exam) === 'missed';

                return (
                  <motion.div
                    key={exam._id || exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card variant="glass" className={`h-full flex flex-col p-6 group hover:bg-white/5 transition-all ${
                      isLive ? 'ring-2 ring-emerald-500/50' : ''
                    }`}>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isLive ? 'bg-emerald-500/20 text-emerald-400' :
                          isCompleted ? 'bg-blue-500/20 text-blue-400' :
                          isMissed ? 'bg-red-500/20 text-red-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {isLive ? <Zap size={24} /> : isCompleted ? <CheckCircle size={24} /> : isMissed ? <XCircle size={24} /> : <Book size={24} />}
                        </div>
                        {isLive && (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> LIVE NOW
                          </span>
                        )}
                        {isMissed && (
                          <span className="px-3 py-1 bg-white/5 text-white/40 text-xs font-medium rounded-full">Not Attempted</span>
                        )}
                        {isCompleted && exam.attemptScore != null && (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            exam.attemptScore >= 40 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {exam.attemptScore}%
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{exam.title}</h3>
                      <p className="text-white/40 text-sm mb-4">
                        {exam.subject || 'General'}
                      </p>

                      {/* Meta */}
                      <div className="space-y-2 text-sm text-white/40 mb-4">
                        {exam.scheduledDate && (
                          <div className="flex items-center gap-2">
                            <Calendar size={14} /> {formatDate(exam.scheduledDate)}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock size={14} /> {exam.durationMinutes} minutes
                        </div>
                        {exam.totalMarks > 0 && (
                          <div className="flex items-center gap-2">
                            <Book size={14} /> {exam.totalMarks} marks {exam.passingMarks ? `(Pass: ${exam.passingMarks}%)` : ''}
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <div className="mt-auto">
                        {isLive ? (
                          <button
                            onClick={() => navigate(`/s/exam/${exam.id || exam._id}`)}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            <Zap size={18} /> Attempt Now
                          </button>
                        ) : isCompleted ? (
                          <button
                            onClick={() => navigate('/s/result')}
                            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/70 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 border border-white/10"
                          >
                            View Result <ArrowRight size={16} />
                          </button>
                        ) : !isMissed ? (
                          <button
                            disabled
                            className="w-full py-2.5 bg-white/5 text-white/30 font-medium rounded-xl border border-white/10 cursor-not-allowed"
                          >
                            <Timer size={16} className="inline mr-2" /> Not Live Yet
                          </button>
                        ) : (
                          <div className="text-center text-white/20 text-sm py-2">Exam ended</div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Exams;