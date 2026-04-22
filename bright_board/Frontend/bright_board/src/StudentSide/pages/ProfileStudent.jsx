import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, BookOpen, Award, MessageSquare, Mail, Phone, MapPin, GraduationCap, Calendar, CreditCard, Lock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Card from '../../components/ui/Card';
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
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-white/40 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-white font-medium">{value || 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Header Profile Section */}
          <div className="relative">
            <div className="h-48 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="px-8 pb-8">
              <div className="relative -mt-16 flex flex-col md:flex-row items-end md:items-center gap-6">
                <div className="w-32 h-32 rounded-2xl bg-black border-4 border-black overflow-hidden shadow-2xl">
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white text-4xl font-bold">
                    {profile?.name?.charAt(0) || <User />}
                  </div>
                </div>
                <div className="flex-1 mb-2">
                  <h1 className="text-3xl font-bold text-white">{profile?.name || 'Student Name'}</h1>
                  <p className="text-white/60 flex items-center gap-2">
                    <GraduationCap size={16} /> Class of 2025 • Science Stream
                  </p>
                </div>
                <div className="flex gap-3 mb-2">
                  <Button variant="outline" size="sm">Edit Profile</Button>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">{error}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              <Card variant="glass" className="p-6 space-y-6">
                <h3 className="text-lg font-bold text-white border-b border-white/10 pb-4">Quick Stats</h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-white/60">
                    <span>Attendance</span>
                    <span className="text-emerald-400">{attSummary.percentage}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${attSummary.percentage}%` }} />
                  </div>
                  <p className="text-xs text-white/40 text-right">{attSummary.attended}/{attSummary.total} Classes</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                        <Award size={16} />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">GPA</p>
                        <p className="text-xs text-white/40">Current Semester</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-white">3.8</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <CreditCard size={16} />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Fees</p>
                        <p className="text-xs text-white/40">Status</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Paid</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-6 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <tab.icon size={16} />
                    {tab.id}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card variant="glass" className="p-8">
                    {activeTab === 'Personal Info' && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoRow icon={User} label="Full Name" value={profile?.name} />
                          <InfoRow icon={Mail} label="Email Address" value={profile?.email} />
                          <InfoRow icon={Phone} label="Phone Number" value={profile?.phone} />
                          <InfoRow icon={MapPin} label="Address" value={profile?.address} />
                          <InfoRow icon={Calendar} label="Date of Birth" value="Jan 15, 2005" />
                          <InfoRow icon={User} label="Guardian Name" value="Parent Name" />
                        </div>
                      </div>
                    )}

                    {activeTab === 'Academic Details' && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white mb-4">Academic Performance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoRow icon={BookOpen} label="Current Grade" value="12th Standard" />
                          <InfoRow icon={Award} label="Overall GPA" value="3.8 / 4.0" />
                        </div>

                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">Current Subjects</h4>
                          <div className="flex flex-wrap gap-2">
                            {['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English'].map((sub, i) => (
                              <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm">
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'Achievements' && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white mb-4">Awards & Achievements</h3>
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-start gap-4">
                            <div className="p-3 rounded-full bg-amber-500/20 text-amber-400">
                              <Award size={24} />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-white">Top Scorer - Midterm 2024</h4>
                              <p className="text-white/60 text-sm mt-1">Achieved the highest aggregate score in the batch for the midterm examinations.</p>
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-4">
                            <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                              <Award size={24} />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-white">Perfect Attendance Award</h4>
                              <p className="text-white/60 text-sm mt-1">Maintained 100% attendance for the Fall semester.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'Feedback & Ratings' && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white mb-4">Tutor Feedback</h3>
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-white">Mathematics Tutor</h4>
                              <span className="text-xs text-white/40">2 days ago</span>
                            </div>
                            <p className="text-white/70 italic">"Shows great improvement in calculus. Needs to focus more on trigonometry concepts."</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'Security' && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white mb-4">Security Settings</h3>
                        {passwordStatus.success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm">{passwordStatus.success}</div>}
                        {passwordStatus.error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{passwordStatus.error}</div>}
                        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                          <div>
                            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Old Password</label>
                            <input type="password" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none" value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">New Password</label>
                            <input type="password" minLength={6} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
                          </div>
                          <div className="pt-2">
                            <Button type="submit" disabled={passwordStatus.loading}>
                              {passwordStatus.loading ? 'Updating...' : 'Update Password'}
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
