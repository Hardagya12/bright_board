import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCog, FaSave, FaUniversity, FaUserShield, FaBell, FaPalette, FaLock } from 'react-icons/fa';
import { Save, CheckCircle2, AlertCircle, User, Building, Phone, BookOpen, MapPin } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getInstituteProfile, updateInstituteProfile } from '../../utils/services/institute';

const Settings = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', contactNumber: '', coursesOffered: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [banner, setBanner] = useState({ open: false, message: '', type: 'success' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getInstituteProfile();
        setProfile(data.institute);
        setForm({
          name: data.institute.name || '',
          address: data.institute.address || '',
          contactNumber: data.institute.contactNumber || '',
          coursesOffered: data.institute.coursesOffered || [],
        });
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await updateInstituteProfile(form);
      setBanner({ open: true, message: 'Settings updated successfully!', type: 'success' });
      setTimeout(() => setBanner({ ...banner, open: false }), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const InputGroup = ({ label, icon: Icon, ...props }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
        {Icon && <Icon size={14} />} {label}
      </label>
      <input
        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
        {...props}
      />
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'Institute Profile', icon: FaUniversity },
    { id: 'security', label: 'Security', icon: FaUserShield },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'appearance', label: 'Appearance', icon: FaPalette },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-5xl mx-auto space-y-8">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Settings</h1>
              <p className="text-white/50">Manage your institute profile and preferences.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <Card variant="glass" className="p-4 h-fit lg:col-span-1">
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    <tab.icon size={18} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </Card>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card variant="glass" className="p-8">
                      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                          {form.name ? form.name.charAt(0) : <Building />}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">Institute Information</h2>
                          <p className="text-white/50 text-sm">Update your institute's public profile.</p>
                        </div>
                      </div>

                      <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputGroup
                            label="Institute Name"
                            icon={Building}
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                          />
                          <InputGroup
                            label="Contact Number"
                            icon={Phone}
                            value={form.contactNumber}
                            onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                          />
                        </div>
                        <InputGroup
                          label="Address"
                          icon={MapPin}
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                        />
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
                            <BookOpen size={14} /> Courses Offered
                          </label>
                          <div className="bg-black/40 border border-white/10 rounded-xl p-2 flex flex-wrap gap-2 min-h-[50px]">
                            {form.coursesOffered.map((course, index) => (
                              <span key={index} className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                                {course}
                                <button
                                  type="button"
                                  onClick={() => setForm({ ...form, coursesOffered: form.coursesOffered.filter((_, i) => i !== index) })}
                                  className="hover:text-white"
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                            <input
                              className="bg-transparent outline-none text-white text-sm min-w-[150px] px-2 py-1"
                              placeholder="Type and press Enter..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const val = e.target.value.trim();
                                  if (val) {
                                    setForm({ ...form, coursesOffered: [...form.coursesOffered, val] });
                                    e.target.value = '';
                                  }
                                }
                              }}
                            />
                          </div>
                          <p className="text-xs text-white/30">Press Enter to add a course</p>
                        </div>

                        <div className="pt-4 flex justify-end">
                          <Button variant="accent" type="submit" className="px-8">
                            <Save size={18} className="mr-2" /> Save Changes
                          </Button>
                        </div>
                      </form>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card variant="glass" className="p-8 text-center py-20">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                        <FaLock size={32} className="text-white/20" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Security Settings</h3>
                      <p className="text-white/50">Password change and 2FA settings coming soon.</p>
                    </Card>
                  </motion.div>
                )}

                {/* Placeholders for other tabs */}
                {(activeTab === 'notifications' || activeTab === 'appearance') && (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card variant="glass" className="p-8 text-center py-20">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                        <FaCog size={32} className="text-white/20" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
                      <p className="text-white/50">This section is under development.</p>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>

      {/* Notification Banner */}
      <AnimatePresence>
        {banner.open && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <div className="bg-[#121212] border border-emerald-500/20 rounded-xl shadow-2xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CheckCircle2 size={18} />
              </div>
              <div className="text-white font-medium">{banner.message}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Settings;