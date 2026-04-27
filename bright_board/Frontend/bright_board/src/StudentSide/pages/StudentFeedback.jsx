import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Star, Send, Trash2, CheckCircle, Reply } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../utils/api';

const feedbackTypes = ['general', 'material', 'exam', 'attendance', 'payment', 'suggestion'];

const StudentFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'general', subject: '', message: '', rating: 5 });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/student/feedback');
      setFeedbackList(data.feedback || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) return;
    setSubmitting(true);
    try {
      await api.post('/student/feedback', form);
      setForm({ type: 'general', subject: '', message: '', rating: 5 });
      setShowForm(false);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this feedback?')) return;
    try {
      await api.delete(`/student/feedback/${id}`);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const timeSince = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return `${Math.floor(days / 7)} weeks ago`;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f9faf6] font-body relative">
      <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
            
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-[#e8ebe6] scrollbar-track-transparent relative z-10 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0e0f0c] font-display tracking-tight mb-2">Feedback Center</h1>
              <p className="text-[#868685] tracking-wide mt-2">Share your thoughts and suggestions with your tutor.</p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className={`px-6 py-3.5 rounded-full font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(0,245,255,0.2)] flex items-center gap-3 ${showForm ? 'bg-white border border-[#e8ebe6] text-[#0e0f0c]' : 'btn-primary'}`}
            >
              <Send size={18} /> {showForm ? 'Cancel' : 'New Feedback'}
            </Button>
          </div>

          {/* Submit Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-10 md:p-12 mb-8 accent-top-cyan shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[#868685] text-[10px] font-bold uppercase tracking-widest ml-1">Feedback Category</label>
                        <select
                          value={form.type}
                          onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                          className="w-full bg-white border border-[#e8ebe6] rounded-full px-5 py-3.5 text-sm font-medium tracking-wide text-[#0e0f0c] outline-none focus:border-cyan-400 focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] transition-all shadow-inner custom-select appearance-none cursor-pointer pr-10"
                          style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem top 50%', backgroundSize: '0.65rem auto' }}
                        >
                          {feedbackTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[#868685] text-[10px] font-bold uppercase tracking-widest ml-1">Subject Title</label>
                        <input
                          type="text"
                          value={form.subject}
                          onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                          required
                          placeholder="Brief subject..."
                          className="w-full bg-white border border-[#e8ebe6] rounded-full px-5 py-3.5 text-sm font-medium tracking-wide text-[#0e0f0c] outline-none focus:border-cyan-400 focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[#868685] text-[10px] font-bold uppercase tracking-widest ml-1">Your Message</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                        required
                        rows={4}
                        placeholder="Write your feedback..."
                        className="w-full bg-white border border-[#e8ebe6] rounded-[24px] px-5 py-4 text-sm font-medium tracking-wide text-[#0e0f0c] outline-none resize-none focus:border-cyan-400 focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] transition-all shadow-inner"
                      />
                    </div>

                    {/* Star Rating */}
                    <div className="space-y-3">
                      <label className="text-[#868685] text-[10px] font-bold uppercase tracking-widest ml-1">Overall Satisfaction</label>
                      <div className="flex gap-4 p-4 rounded-full bg-white/[0.02] border border-[#e8ebe6] w-fit">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, rating: n }))}
                            className="transition-transform hover:scale-110 active:scale-95"
                          >
                            <Star
                              size={32}
                              className={`transition-colors ${n <= form.rating ? 'text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(0,245,255,0.6)]' : 'text-[#e8ebe6]'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 btn-primary rounded-full font-bold tracking-wide shadow-glow-cyan transition-all mt-4"
                    >
                      {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback History */}
          <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm overflow-hidden accent-top-purple">
            <div className="p-8 border-b border-[#e8ebe6]">
              <h3 className="text-2xl font-bold text-[#0e0f0c] font-display tracking-tight">Recent Feedback</h3>
            </div>
            {loading ? (
              <div className="p-8 space-y-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-[24px] bg-white" />)}
              </div>
            ) : feedbackList.length === 0 ? (
              <div className="p-16 text-center border-dashed border-[#e8ebe6] m-8 rounded-[24px]">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-6 border border-[#e8ebe6] shadow-inner">
                  <MessageSquare size={32} className="text-[#e8ebe6]" />
                </div>
                <h3 className="text-2xl font-bold text-[#0e0f0c] mb-2 font-display">No Feedback History</h3>
                <p className="text-[#868685] tracking-wide font-medium">Share your first feedback with your tutor.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {feedbackList.map((fb, idx) => (
                  <motion.div key={fb.id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="group">
                    <div className="p-8 hover:bg-white/[0.02] transition-colors relative">
                      <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-5">
                        <div className="flex items-start gap-5">
                           <div className="w-12 h-12 rounded-[16px] bg-white border border-[#e8ebe6] flex items-center justify-center shrink-0 shadow-inner group-hover:bg-cyan-500/10 group-hover:text-cyan-400 group-hover:border-cyan-400/30 transition-all">
                             <MessageSquare size={20} />
                           </div>
                           <div>
                             <div className="flex items-center gap-3 mb-1">
                               <span className="px-3 py-1 bg-white border border-[#e8ebe6] rounded-full text-[10px] font-bold text-[#868685] uppercase tracking-widest shadow-inner">{fb.type}</span>
                               <h3 className="text-xl font-bold text-[#0e0f0c] font-display tracking-wide">{fb.subject}</h3>
                             </div>
                             <div className="flex gap-1 mt-2">
                               {[1, 2, 3, 4, 5].map(n => (
                                 <Star key={n} size={14} className={n <= (fb.rating || 0) ? 'text-cyan-400 fill-cyan-400' : 'text-[#e8ebe6]'} />
                               ))}
                             </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                          {fb.reply ? (
                            <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-2 border border-emerald-500/20 shadow-[inset_0_0_15px_rgba(52,211,153,0.1)]">
                              <Reply size={14} /> Replied
                            </span>
                          ) : fb.isRead ? (
                            <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest rounded-full border border-blue-500/20">Seen</span>
                          ) : (
                            <span className="px-4 py-1.5 bg-white text-[#868685] text-xs font-bold uppercase tracking-widest rounded-full border border-[#e8ebe6]">Pending</span>
                          )}
                          {!fb.reply && (
                            <button onClick={() => handleDelete(fb.id || fb._id)} className="p-2 hover:bg-red-500/20 text-[#868685] hover:text-red-400 rounded-[12px] transition-all border border-transparent hover:border-red-500/30">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="bg-white rounded-[20px] p-5 border border-[#e8ebe6] shadow-inner mb-4">
                        <p className="text-[#0e0f0c]/70 text-sm tracking-wide font-medium leading-relaxed">{fb.message}</p>
                      </div>

                      <div className="flex justify-end">
                         <span className="text-[#868685] text-[10px] font-bold uppercase tracking-widest">{timeSince(fb.createdAt)}</span>
                      </div>

                      {/* Tutor Reply */}
                      {fb.reply && (
                        <div className="mt-6 p-6 rounded-[24px] bg-cyan-500/5 border border-cyan-400/20 shadow-[inset_0_0_20px_rgba(0,245,255,0.05)] ml-8 md:ml-12 relative">
                          <div className="absolute top-6 -left-3 w-3 h-px bg-cyan-400/30"></div>
                          <div className="flex items-center gap-2 mb-2">
                             <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_currentColor]"></span>
                             <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest">Tutor Reply</p>
                          </div>
                          <p className="text-[#0e0f0c]/80 text-sm tracking-wide font-medium leading-relaxed">{fb.reply}</p>
                          {fb.repliedAt && <p className="text-[#868685] text-[10px] font-bold uppercase tracking-widest mt-4 text-right">{timeSince(fb.repliedAt)}</p>}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeedback;
