import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Star, Send, CheckCircle2, AlertCircle, Eye, Reply, Clock, X } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import api from '../../utils/api';

const Feedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFb, setSelectedFb] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, replied

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/support/student-feedback');
      setFeedbackList(data.feedback || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleReply = async (id) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/support/student-feedback/${id}/reply`, { reply: replyText });
      setReplyText('');
      setSelectedFb(null);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/support/student-feedback/${id}/read`);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = feedbackList.filter(f => {
    if (filter === 'unread') return !f.isRead;
    if (filter === 'replied') return !!f.reply;
    return true;
  });

  const unreadCount = feedbackList.filter(f => !f.isRead).length;

  const timeSince = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-5xl mx-auto space-y-8">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Student Feedback</h1>
              <p className="text-white/50">View and respond to feedback from your students.</p>
            </div>
            {unreadCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                <MessageSquare size={16} className="text-cyan-400" />
                <span className="text-cyan-400 text-sm font-medium">{unreadCount} unread</span>
              </div>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 bg-white/5 rounded-xl p-1">
            {[
              { key: 'all', label: `All (${feedbackList.length})` },
              { key: 'unread', label: `Unread (${feedbackList.filter(f => !f.isRead).length})` },
              { key: 'replied', label: `Replied (${feedbackList.filter(f => f.reply).length})` },
            ].map(tab => (
              <button key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  filter === tab.key ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Feedback List */}
          {loading ? (
            <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <Card variant="glass" className="p-12 text-center">
              <MessageSquare size={32} className="text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Feedback</h3>
              <p className="text-white/40">No student feedback matches your filter.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filtered.map((fb, idx) => (
                <motion.div key={fb.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                  <Card variant="glass" className={`p-5 ${!fb.isRead ? 'border-l-4 border-l-cyan-500' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-white font-bold text-sm">
                          {fb.studentName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-sm">{fb.studentName || 'Unknown Student'}</h4>
                          <p className="text-white/40 text-xs">{fb.studentEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/60 capitalize">{fb.type}</span>
                        {fb.reply ? (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full">Replied</span>
                        ) : !fb.isRead ? (
                          <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-xs font-medium rounded-full">New</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-white/5 text-white/40 text-xs rounded-full">Read</span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-white font-bold mb-1">{fb.subject}</h3>
                    <p className="text-white/60 text-sm mb-3">{fb.message}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} size={12} className={n <= (fb.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-white/10'} />
                          ))}
                        </div>
                        <span className="text-white/30 text-xs">{timeSince(fb.createdAt)}</span>
                      </div>
                      <div className="flex gap-2">
                        {!fb.isRead && (
                          <button onClick={() => markRead(fb.id)} className="px-3 py-1 bg-white/5 text-white/50 text-xs rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1">
                            <Eye size={12} /> Mark Read
                          </button>
                        )}
                        {!fb.reply && (
                          <button onClick={() => { setSelectedFb(fb); setReplyText(''); }}
                            className="px-3 py-1 bg-cyan-600/80 text-white text-xs rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-1">
                            <Reply size={12} /> Reply
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Existing Reply */}
                    {fb.reply && (
                      <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xs text-cyan-400 font-medium mb-1">Your Reply:</p>
                        <p className="text-white/70 text-sm">{fb.reply}</p>
                        {fb.repliedAt && <p className="text-white/30 text-xs mt-1">{timeSince(fb.repliedAt)}</p>}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {selectedFb && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedFb(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="p-5 border-b border-white/10 flex justify-between items-center">
                <div>
                  <h3 className="text-white font-bold">Reply to {selectedFb.studentName}</h3>
                  <p className="text-white/40 text-sm">{selectedFb.subject}</p>
                </div>
                <button onClick={() => setSelectedFb(null)} className="text-white/40 hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-5">
                <div className="p-3 rounded-xl bg-white/5 mb-4 text-white/60 text-sm">{selectedFb.message}</div>
                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} placeholder="Write your reply..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none focus:ring-2 focus:ring-cyan-500/50 mb-4" />
                <button onClick={() => handleReply(selectedFb.id)} disabled={submitting || !replyText.trim()}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Send size={16} /> {submitting ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Feedback;