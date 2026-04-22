import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Star, Send, Trash2, CheckCircle, Clock, Reply } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Card from '../../components/ui/Card';
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
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Feedback</h1>
              <p className="text-white/50">Share your thoughts with your tutor.</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              <Send size={16} /> {showForm ? 'Cancel' : 'New Feedback'}
            </button>
          </div>

          {/* Submit Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <Card variant="glass" className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/60 text-sm mb-1 block">Type</label>
                        <select
                          value={form.type}
                          onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                        >
                          {feedbackTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-white/60 text-sm mb-1 block">Subject</label>
                        <input
                          type="text"
                          value={form.subject}
                          onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                          required
                          placeholder="Brief subject..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Message</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                        required
                        rows={4}
                        placeholder="Your feedback..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none focus:ring-2 focus:ring-cyan-500/50"
                      />
                    </div>

                    {/* Star Rating */}
                    <div>
                      <label className="text-white/60 text-sm mb-2 block">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, rating: n }))}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              size={28}
                              className={n <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
                    >
                      {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback History */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl bg-white/5" />)}
            </div>
          ) : feedbackList.length === 0 ? (
            <Card variant="glass" className="p-12 text-center">
              <MessageSquare size={32} className="text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Feedback Yet</h3>
              <p className="text-white/40">Share your first feedback with your tutor.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {feedbackList.map((fb, idx) => (
                <motion.div key={fb.id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card variant="glass" className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/60 capitalize">{fb.type}</span>
                        <h3 className="text-white font-bold">{fb.subject}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {fb.reply ? (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full flex items-center gap-1">
                            <Reply size={12} /> Replied
                          </span>
                        ) : fb.isRead ? (
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full">Seen</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-white/5 text-white/40 text-xs font-medium rounded-full">Pending</span>
                        )}
                        {!fb.reply && (
                          <button onClick={() => handleDelete(fb.id || fb._id)} className="p-1 hover:bg-red-500/10 text-white/30 hover:text-red-400 rounded transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-white/70 text-sm mb-3">{fb.message}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} size={14} className={n <= (fb.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-white/10'} />
                        ))}
                      </div>
                      <span className="text-white/30 text-xs">{timeSince(fb.createdAt)}</span>
                    </div>

                    {/* Tutor Reply */}
                    {fb.reply && (
                      <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xs text-cyan-400 font-medium mb-1">Tutor Reply:</p>
                        <p className="text-white/70 text-sm">{fb.reply}</p>
                        {fb.repliedAt && <p className="text-white/30 text-xs mt-2">{timeSince(fb.repliedAt)}</p>}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentFeedback;
