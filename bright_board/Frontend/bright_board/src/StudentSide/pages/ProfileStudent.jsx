import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, BookOpen, Award, MessageSquare, Mail, Phone, MapPin, GraduationCap, Calendar, CreditCard, Lock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Button from '../../components/ui/Button';
import { getStudentAttendance } from '../../utils/services/attendance';
import api from '../../utils/api';

const tabs = [
  { id: 'Personal Info', icon: User },
  { id: 'Academic Details', icon: BookOpen },
  { id: 'Achievements', icon: Award },
  { id: 'Feedback & Ratings', icon: MessageSquare },
  { id: 'Security', icon: Lock },
];

const StudentProfile = () => {
  const [activeTab, setActiveTab] = useState('Personal Info');
  const [profile, setProfile] = useState(null);
  const [attSummary, setAttSummary] = useState({ attended: 0, total: 0, percentage: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: '', success: '' });

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordStatus({ loading: true, error: '', success: '' });
    try {
      await api.put('/students/auth/password', passwordForm);
      setPasswordStatus({ loading: false, error: '', success: 'Password updated successfully!' });
      setPasswordForm({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setPasswordStatus({ loading: false, error: err.response?.data?.error || err.message, success: '' });
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/students/me');
        setProfile(data.student || null);
        try {
          const { data: att } = await getStudentAttendance();
          const logs = att.attendance || [];
          const attended = logs.filter(l => l.status === 'present').length;
          const total = logs.length;
          const percentage = total ? Math.round((attended / total) * 100) : 0;
          setAttSummary({ attended, total, percentage });
        } catch { }
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-5 p-5 rounded-[20px] bg-white/[0.03] border border-[#e8ebe6] hover:bg-white/[0.06] hover:border-[#e8ebe6] transition-colors duration-300">
      <div className="w-12 h-12 rounded-[16px] bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] text-[#868685] uppercase tracking-widest font-bold mb-1">{label}</p>
        <p className="text-[#0e0f0c] font-medium tracking-wide">{value || 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f9faf6] font-body relative">
      <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
            
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent relative z-10">
        <div className="max-w-5xl mx-auto space-y-10">

          {/* Header Profile Section */}
          <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm overflow-hidden p-0">
            <div className="h-56 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/80 to-purple-500/80 mix-blend-overlay" />
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#08080f] to-transparent"></div>
            </div>
            <div className="px-10 pb-10">
              <div className="relative -mt-20 flex flex-col md:flex-row items-end md:items-center gap-8">
                <div className="w-40 h-40 rounded-[32px] bg-[#0f0f1a] border-[6px] border-[#08080f] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex items-center justify-center relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-500 opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="text-[#0e0f0c] text-6xl font-bold font-display z-10 drop-shadow-lg">
                    {profile?.name?.charAt(0) || <User size={48} />}
                  </div>
                </div>
                <div className="flex-1 mb-2">
                  <h1 className="text-4xl font-bold text-[#0e0f0c] font-display tracking-tight drop-shadow-md">{profile?.name || 'Student Identity'}</h1>
                  <p className="text-[#868685] flex items-center gap-2 mt-2 tracking-wide text-sm font-medium">
                    <GraduationCap size={16} className="text-purple-400" /> Class of 2025 • Core Academic Stream
                  </p>
                </div>
                <div className="flex gap-4 mb-2">
                  <Button className="bg-white border border-[#e8ebe6] hover:bg-[#e2f6d5] text-[#0e0f0c] rounded-full px-6 py-2.5 transition-all duration-300">Modify Data</Button>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="text-red-400 bg-red-500/10 p-5 rounded-[20px] border border-red-500/20 backdrop-blur-md font-medium tracking-wide">{error}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Stats Sidebar */}
            <div className="space-y-8">
              <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-8 space-y-8 accent-top-cyan">
                <h3 className="text-xl font-bold text-[#0e0f0c] font-display tracking-wide border-b border-[#e8ebe6] pb-4">Biometrics & Stats</h3>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium text-[#868685]">
                    <span>Attendance Rate</span>
                    <span className="text-emerald-400 font-bold">{attSummary.percentage}%</span>
                  </div>
                  <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-[#e8ebe6] shadow-inner">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ width: `${attSummary.percentage}%` }} />
                  </div>
                  <p className="text-xs text-[#868685] text-right tracking-widest uppercase font-bold">{attSummary.attended}/{attSummary.total} Nodes</p>
                </div>

                <div className="space-y-5 pt-5 border-t border-[#e8ebe6]">
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-[14px] bg-amber-500/10 flex items-center justify-center text-amber-400 shadow-inner group-hover:bg-amber-500/20 transition-colors">
                        <Award size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-[#0e0f0c] font-bold tracking-wide">Performance Index</p>
                        <p className="text-[10px] text-[#868685] uppercase tracking-widest font-bold">Current Cycle</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-[#0e0f0c] font-display drop-shadow-md">3.8</span>
                  </div>

                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-[14px] bg-purple-500/10 flex items-center justify-center text-purple-400 shadow-inner group-hover:bg-purple-500/20 transition-colors">
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-[#0e0f0c] font-bold tracking-wide">Ledger Status</p>
                        <p className="text-[10px] text-[#868685] uppercase tracking-widest font-bold">Financial</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.1)]">Cleared</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Tabs */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm rounded-full w-fit max-w-full overflow-x-auto custom-scrollbar border border-[#e8ebe6] shadow-lg">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-cyan-400/20 to-purple-500/20 border border-cyan-400/30 text-[#0e0f0c] shadow-[inset_0_0_15px_rgba(0,245,255,0.1)]'
                        : 'text-[#868685] hover:text-[#0e0f0c] hover:bg-white border border-transparent'
                      }`}
                  >
                    <tab.icon size={16} className={activeTab === tab.id ? 'text-cyan-400' : 'text-[#868685]'} />
                    {tab.id}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-8 md:p-10 accent-top-purple min-h-[400px]">
                    {activeTab === 'Personal Info' && (
                      <div className="space-y-8">
                        <h3 className="text-2xl font-bold text-[#0e0f0c] font-display tracking-tight mb-6">Personal Identifiers</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <InfoRow icon={User} label="Designated Name" value={profile?.name} />
                          <InfoRow icon={Mail} label="Comms Channel" value={profile?.email} />
                          <InfoRow icon={Phone} label="Voice Contact" value={profile?.phone} />
                          <InfoRow icon={MapPin} label="Physical Coordinates" value={profile?.address} />
                          <InfoRow icon={Calendar} label="Origin Date" value="Jan 15, 2005" />
                          <InfoRow icon={User} label="Primary Guardian" value="Parent Unit" />
                        </div>
                      </div>
                    )}

                    {activeTab === 'Academic Details' && (
                      <div className="space-y-8">
                        <h3 className="text-2xl font-bold text-[#0e0f0c] font-display tracking-tight mb-6">Academic Metrics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <InfoRow icon={BookOpen} label="Current Level" value="Advanced Segment" />
                          <InfoRow icon={Award} label="Aggregate Score" value="3.8 / 4.0" />
                        </div>

                        <div className="mt-8">
                          <h4 className="text-xs font-bold text-[#868685] uppercase tracking-widest mb-4">Active Modules</h4>
                          <div className="flex flex-wrap gap-3">
                            {['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Linguistics'].map((sub, i) => (
                              <span key={i} className="px-4 py-2 rounded-full bg-white/[0.04] border border-[#e8ebe6] text-[#0e0f0c] text-sm font-medium shadow-inner tracking-wide hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-colors cursor-default">
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'Achievements' && (
                      <div className="space-y-8">
                        <h3 className="text-2xl font-bold text-[#0e0f0c] font-display tracking-tight mb-6">Honors & Accolades</h3>
                        <div className="space-y-5">
                          <div className="p-6 rounded-[20px] bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-start gap-5 shadow-lg group">
                            <div className="p-4 rounded-[16px] bg-amber-500/20 text-amber-400 shadow-inner group-hover:scale-110 transition-transform">
                              <Award size={28} />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-[#0e0f0c] font-display tracking-wide">Top Scorer - Midterm Phase</h4>
                              <p className="text-[#868685] text-sm mt-2 leading-relaxed">Achieved the highest aggregate computation score in the cluster for the recent evaluation period.</p>
                            </div>
                          </div>
                          <div className="p-6 rounded-[20px] bg-white/[0.03] border border-[#e8ebe6] flex items-start gap-5 hover:bg-white/[0.06] transition-colors group">
                            <div className="p-4 rounded-[16px] bg-cyan-500/10 text-cyan-400 shadow-inner group-hover:scale-110 transition-transform">
                              <CheckCircle2 size={28} />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-[#0e0f0c] font-display tracking-wide">Perfect Attendance Node</h4>
                              <p className="text-[#868685] text-sm mt-2 leading-relaxed">Maintained a 100% presence registry for the entire Fall synchronization cycle.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'Feedback & Ratings' && (
                      <div className="space-y-8">
                        <h3 className="text-2xl font-bold text-[#0e0f0c] font-display tracking-tight mb-6">Instructor Evaluations</h3>
                        <div className="space-y-5">
                          <div className="p-6 rounded-[20px] bg-white/[0.03] border border-[#e8ebe6] relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex justify-between items-start mb-3 pl-2">
                              <div>
                                <h4 className="font-bold text-[#0e0f0c] text-lg tracking-wide">Mathematics Supervisor</h4>
                                <span className="text-[10px] uppercase font-bold text-[#868685] tracking-widest mt-1 block">T-minus 48 Hours</span>
                              </div>
                            </div>
                            <p className="text-[#0e0f0c]/70 italic leading-relaxed pl-2">"Demonstrates exceptional computation capacity in calculus modules. Advise secondary focus on trigonometric algorithms for optimal performance."</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'Security' && (
                      <div className="space-y-8">
                        <h3 className="text-2xl font-bold text-[#0e0f0c] font-display tracking-tight mb-6">Security Protocols</h3>
                        {passwordStatus.success && <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium tracking-wide shadow-[0_0_20px_rgba(52,211,153,0.1)]">{passwordStatus.success}</div>}
                        {passwordStatus.error && <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium tracking-wide shadow-[0_0_20px_rgba(248,113,113,0.1)]">{passwordStatus.error}</div>}
                        <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-md">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-[#868685] uppercase tracking-widest ml-1 flex items-center gap-2"><Lock size={14} className="text-cyan-400"/> Current Key</label>
                            <input type="password" required className="w-full bg-white border border-[#e8ebe6] rounded-xl px-5 py-3.5 text-[#0e0f0c] focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,245,255,0.15)] outline-none transition-all placeholder:text-[#e8ebe6]" value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} placeholder="••••••••" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-[#868685] uppercase tracking-widest ml-1 flex items-center gap-2"><Lock size={14} className="text-purple-400"/> New Key</label>
                            <input type="password" minLength={6} required className="w-full bg-white border border-[#e8ebe6] rounded-xl px-5 py-3.5 text-[#0e0f0c] focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,245,255,0.15)] outline-none transition-all placeholder:text-[#e8ebe6]" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} placeholder="••••••••" />
                          </div>
                          <div className="pt-4 border-t border-[#e8ebe6]">
                            <Button className="btn-primary shadow-glow-cyan px-8 py-3 rounded-full text-sm font-bold tracking-wide" type="submit" disabled={passwordStatus.loading}>
                              {passwordStatus.loading ? 'Updating Matrix...' : 'Rotate Security Key'}
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Quick import fix for CheckCircle2
import { CheckCircle2 } from 'lucide-react';

export default StudentProfile;
