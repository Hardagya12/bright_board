import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Calendar, Clock, ArrowRight, AlertCircle, Zap, CheckCircle, XCircle, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
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
    <div className="flex h-screen overflow-hidden bg-[#f9faf6] font-body relative">
      <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
      
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-[#e8ebe6] scrollbar-track-transparent relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">

          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#0e0f0c] font-display tracking-tight mb-2">My Exams</h1>
            <p className="text-[#868685] tracking-wide mt-2">View, attempt, and track your examinations.</p>
          </div>

          {error && (
            <div className="p-5 rounded-[20px] bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 font-medium shadow-inner">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 bg-white border border-[#e8ebe6] rounded-full p-1.5 w-fit shadow-card">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[100px] py-2.5 px-6 rounded-full text-sm font-bold tracking-wide capitalize transition-all duration-300 relative ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-cyan-400/20 to-purple-500/20 text-[#0e0f0c] shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] border border-cyan-400/30'
                    : 'text-[#868685] hover:text-[#0e0f0c] hover:bg-[#f9faf6] border border-transparent'
                }`}
              >
                {tab === 'live' && liveCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full text-[10px] font-bold flex items-center justify-center text-[#0f0f1a] shadow-glow-green animate-pulse">
                    {liveCount}
                  </span>
                )}
                {tab} ({categorized[tab].length})
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-[24px] bg-[#e8ebe6]" />)}
            </div>
          ) : currentExams.length === 0 ? (
            <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-12 md:p-16 text-center border-dashed">
              <div className="w-24 h-24 rounded-[24px] bg-[#f9faf6] flex items-center justify-center mx-auto mb-6 text-[#868685] shadow-inner border border-[#e8ebe6]">
                <Book size={48} />
              </div>
              <h3 className="text-2xl font-bold text-[#0e0f0c] font-display mb-2">
                {activeTab === 'live' ? 'No Live Exams' :
                 activeTab === 'upcoming' ? 'No Upcoming Exams' :
                 activeTab === 'completed' ? 'No Completed Exams' :
                 'No Missed Exams'}
              </h3>
              <p className="text-[#868685] tracking-wide">
                {activeTab === 'live' ? 'No exams are currently live.' :
                 activeTab === 'upcoming' ? 'No exams scheduled. Check back later.' :
                 activeTab === 'completed' ? 'You haven\'t completed any exams yet.' :
                 'You haven\'t missed any exams. Great job!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentExams.map((exam, idx) => {
                const isLive = categorize(exam) === 'live';
                const isCompleted = categorize(exam) === 'completed';
                const isMissed = categorize(exam) === 'missed';
                
                let accent = 'purple';
                if (isLive) accent = 'cyan';
                if (isCompleted) accent = 'green';
                if (isMissed) accent = 'pink';

                return (
                  <motion.div
                    key={exam._id || exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className={`bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm h-full flex flex-col p-8 group hover:-translate-y-2 transition-all duration-300 accent-top-${accent} ${
                      isLive ? 'shadow-[0_10px_40px_rgba(0,245,255,0.15)] border-cyan-400/30' : ''
                    }`}>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-14 h-14 rounded-[16px] flex items-center justify-center shadow-inner ${
                          isLive ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
                          isCompleted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          isMissed ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                          'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        }`}>
                          {isLive ? <Zap size={28} /> : isCompleted ? <CheckCircle size={28} /> : isMissed ? <XCircle size={28} /> : <Book size={28} />}
                        </div>
                        {isLive && (
                          <span className="flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 text-[10px] font-bold rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(0,245,255,0.1)]">
                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-glow-cyan" /> LIVE NOW
                          </span>
                        )}
                        {isMissed && (
                          <span className="px-4 py-1.5 bg-white border border-[#e8ebe6] text-[#868685] text-[10px] font-bold rounded-full uppercase tracking-widest shadow-inner">Not Attempted</span>
                        )}
                        {isCompleted && exam.attemptScore != null && (
                          <span className={`px-4 py-1.5 rounded-full border text-xs font-bold shadow-inner ${
                            exam.attemptScore >= 40 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                          }`}>
                            {exam.attemptScore}%
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <h3 className="text-xl font-bold text-[#0e0f0c] font-display tracking-wide mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">{exam.title}</h3>
                      <p className="text-[#868685] text-xs font-bold uppercase tracking-widest mb-6">
                        {exam.subject || 'General'}
                      </p>

                      {/* Meta */}
                      <div className="space-y-3 text-sm font-medium tracking-wide text-[#868685] mb-8 bg-[#f9faf6] p-4 rounded-[16px] border border-[#e8ebe6]">
                        {exam.scheduledDate && (
                          <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-[#868685]" /> {formatDate(exam.scheduledDate)}
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <Clock size={16} className="text-[#868685]" /> {exam.durationMinutes} minutes
                        </div>
                        {exam.totalMarks > 0 && (
                          <div className="flex items-center gap-3">
                            <Book size={16} className="text-[#868685]" /> {exam.totalMarks} marks {exam.passingMarks ? <span className="text-[#868685] text-xs uppercase ml-1">(Pass: {exam.passingMarks}%)</span> : ''}
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <div className="mt-auto pt-2 border-t border-[#e8ebe6]">
                        {isLive ? (
                          <Button
                            onClick={() => navigate(`/s/exam/${exam.id || exam._id}`)}
                            className="w-full py-3.5 btn-primary rounded-full flex items-center justify-center gap-2 shadow-glow-cyan font-bold tracking-wide mt-2"
                          >
                            <Zap size={18} /> Attempt Assessment
                          </Button>
                        ) : isCompleted ? (
                          <Button
                            onClick={() => navigate('/s/result')}
                            className="w-full py-3.5 bg-[#f9faf6] hover:bg-[#e2f6d5] text-[#0e0f0c] font-bold rounded-full transition-colors flex items-center justify-center gap-2 border border-[#e8ebe6] mt-2"
                          >
                            View Result <ArrowRight size={18} />
                          </Button>
                        ) : !isMissed ? (
                          <div className="w-full py-3.5 bg-[#f9faf6] text-[#868685] font-bold rounded-full border border-[#e8ebe6] flex items-center justify-center gap-2 mt-2">
                            <Timer size={18} /> Not Live Yet
                          </div>
                        ) : (
                          <div className="text-center text-[#868685] text-xs font-bold uppercase tracking-widest py-3 mt-2">Assessment Concluded</div>
                        )}
                      </div>
                    </div>
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