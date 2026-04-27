import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCog, FaSave, FaUniversity, FaUserShield, FaBell, FaPalette, FaLock } from 'react-icons/fa';
import { Save, CheckCircle2, AlertCircle, User, Building, Phone, BookOpen, MapPin, X } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { getInstituteProfile, updateInstituteProfile } from '../../utils/services/institute';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { LightbulbSVG, ClipboardSVG, ChalkboardSVG } from '../../components/svg/SchoolIllustrations';

const InputGroup = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-[#454745] uppercase tracking-wider flex items-center gap-2 ml-1">
      {Icon && <Icon size={14} className="text-[#163300]" />} {label}
    </label>
    <input
      className="input-wise w-full"
      {...props}
    />
  </div>
);

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
      setBanner({ open: true, message: 'Settings saved successfully!', type: 'success' });
      setTimeout(() => setBanner(prev => ({ ...prev, open: false })), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Institute Profile', icon: FaUniversity },
    { id: 'security', label: 'Security', icon: FaUserShield },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'appearance', label: 'Appearance', icon: FaPalette },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bb-offwhite)] font-body relative notebook-lines">
      {/* Decorative SVG Elements */}
      <div className="absolute top-[10%] right-[5%] hidden lg:block opacity-60">
        <LightbulbSVG size={100} />
      </div>
      <div className="absolute bottom-[5%] left-[20%] hidden md:block opacity-50">
        <ClipboardSVG size={120} />
      </div>

      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-[#9fe870] scrollbar-track-transparent relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative">
              <h1 className="text-4xl md:text-5xl font-bold text-[#0e0f0c] tracking-tight mb-2 font-display relative inline-block">
                Settings
                <div className="doodle-underline w-full absolute bottom-[-4px] left-0"></div>
              </h1>
              <p className="text-[#868685] font-bold text-sm mt-4 uppercase tracking-widest">Configure global preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <Card variant="default" className="p-4 h-fit lg:col-span-1 shadow-sm">
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-full transition-all duration-300 font-bold ${activeTab === tab.id
                        ? 'bg-[#e2f6d5] text-[#163300]'
                        : 'text-[#868685] hover:bg-[#f9faf6] hover:text-[#454745]'
                      }`}
                  >
                    <tab.icon size={18} className={activeTab === tab.id ? 'text-[#163300]' : 'text-[#868685]'} />
                    <span>{tab.label}</span>
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card variant="default" className="p-8 md:p-10" accentColor="green">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10 pb-8 border-b border-[#e8ebe6]">
                        <div className="w-20 h-20 rounded-[20px] bg-[#9fe870] flex items-center justify-center text-[#163300] text-3xl font-display shadow-[4px_4px_0_#163300] relative overflow-hidden group">
                          {form.name ? form.name.charAt(0) : <Building size={32} />}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-[#0e0f0c] font-display tracking-tight">Institutional Core</h2>
                          <p className="text-[#868685] text-sm font-medium mt-1">Manage public facing identity parameters.</p>
                        </div>
                      </div>

                      <form onSubmit={submit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputGroup
                            label="Institute Name"
                            icon={Building}
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Bright Academy"
                          />
                          <InputGroup
                            label="Contact Number"
                            icon={Phone}
                            value={form.contactNumber}
                            onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                        <InputGroup
                          label="Physical Address"
                          icon={MapPin}
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          placeholder="Full physical address"
                        />
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-[#454745] uppercase tracking-wider flex items-center gap-2 ml-1">
                            <BookOpen size={14} className="text-[#163300]" /> Active Programs
                          </label>
                          <div className="bg-white border-2 border-[#e8ebe6] rounded-[24px] p-4 flex flex-wrap gap-2 min-h-[60px] focus-within:border-[#9fe870] transition-colors">
                            <AnimatePresence>
                              {form.coursesOffered.map((course, index) => (
                                <motion.span 
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  key={index} 
                                  className="bg-[#e2f6d5] text-[#163300] font-bold px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                                >
                                  {course}
                                  <button
                                    type="button"
                                    onClick={() => setForm({ ...form, coursesOffered: form.coursesOffered.filter((_, i) => i !== index) })}
                                    className="hover:text-[#d03238] w-5 h-5 flex items-center justify-center rounded-full hover:bg-white transition-colors"
                                  >
                                    <X size={14} />
                                  </button>
                                </motion.span>
                              ))}
                            </AnimatePresence>
                            <input
                              className="bg-transparent outline-none text-[#0e0f0c] text-sm font-medium min-w-[200px] px-3 py-2 placeholder:text-[#868685]"
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
                          <p className="text-xs text-[#868685] font-medium ml-2">Press [Enter] to add a new program.</p>
                        </div>

                        <div className="pt-6 border-t border-[#e8ebe6] flex justify-end">
                          <Button variant="primary" type="submit">
                            <Save size={18} /> Save Settings
                          </Button>
                        </div>
                      </form>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card variant="default" className="p-12 text-center py-24 border-2 border-dashed border-[#e8ebe6]">
                      <div className="w-24 h-24 rounded-full bg-[#f9faf6] flex items-center justify-center mx-auto mb-8 border border-[#e8ebe6]">
                        <FaLock size={36} className="text-[#868685]" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#0e0f0c] mb-3 font-display tracking-tight">Security & Access</h3>
                      <p className="text-[#868685] tracking-wide max-w-md mx-auto font-medium">This module is currently being built. Please check back later.</p>
                    </Card>
                  </motion.div>
                )}

                {(activeTab === 'notifications' || activeTab === 'appearance') && (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card variant="default" className="p-12 text-center py-24 border-2 border-dashed border-[#e8ebe6]">
                      <div className="w-24 h-24 rounded-[20px] bg-[#f9faf6] flex items-center justify-center mx-auto mb-8 border border-[#e8ebe6]">
                        <FaCog size={36} className="text-[#868685] animate-[spin_10s_linear_infinite]" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#0e0f0c] mb-3 font-display tracking-tight">Coming Soon</h3>
                      <p className="text-[#868685] tracking-wide font-medium">This feature is currently under construction.</p>
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
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <div className="bg-[#e2f6d5] border-2 border-[#163300] rounded-[20px] shadow-[4px_4px_0_#163300] p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#9fe870] flex items-center justify-center text-[#163300] border-2 border-[#163300]">
                <CheckCircle2 size={20} />
              </div>
              <div className="text-[#163300] font-bold tracking-wide pr-4 text-sm">{banner.message}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Settings;