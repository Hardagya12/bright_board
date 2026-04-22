import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus, Send, ChevronDown, ChevronUp, Clock, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../utils/api';

const categories = ['technical', 'payment', 'attendance', 'exam', 'other'];
const priorities = ['low', 'medium', 'high'];

const statusColors = {
  open: 'bg-amber-500/20 text-amber-400',
  'in-progress': 'bg-blue-500/20 text-blue-400',
  resolved: 'bg-emerald-500/20 text-emerald-400',
  closed: 'bg-white/10 text-white/50',
};

const priorityColors = {
  low: 'bg-white/10 text-white/50',
  medium: 'bg-amber-500/10 text-amber-400',
  high: 'bg-red-500/10 text-red-400',
};

const StudentSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [form, setForm] = useState({ subject: '', description: '', category: 'other', priority: 'medium' });
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/student/support/tickets');
      setTickets(data.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.description) return;
    setSubmitting(true);
    try {
      await api.post('/student/support/tickets', form);
      setForm({ subject: '', description: '', category: 'other', priority: 'medium' });
      setShowForm(false);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (ticketId) => {
    if (!reply.trim()) return;
    try {
      await api.post(`/student/support/tickets/${ticketId}/message`, { message: reply });
      setReply('');
      load();
      // Refresh selected ticket
      const updated = tickets.find(t => (t.id || t._id) === ticketId);
      if (updated) {
        const msgs = [...(updated.messages || []), { sender: 'student', message: reply, sentAt: new Date() }];
        setSelectedTicket({ ...updated, messages: msgs });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const faqs = [
    { q: 'How is attendance calculated?', a: 'Attendance is calculated as the percentage of classes marked "present" out of total classes held.' },
    { q: 'When will my results be published?', a: 'Results are published by your tutor. If immediate results are disabled, you\'ll see them once the tutor publishes.' },
    { q: 'How do I download study materials?', a: 'Go to Study Materials page, find the material, and click the Download button.' },
    { q: 'What if my exam auto-submits?', a: 'If your exam auto-submits due to tab switches (3 violations), timeouts, your answers until that point are saved.' },
    { q: 'How to contact my tutor about payments?', a: 'Use the Feedback page to send a payment-related feedback, or raise a Support ticket with category "Payment".' },
  ];

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
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Support</h1>
              <p className="text-white/50">Raise tickets and get help from your tutor.</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              <Plus size={16} /> {showForm ? 'Cancel' : 'New Ticket'}
            </button>
          </div>

          {/* Create Ticket Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <Card variant="glass" className="p-6">
                  <form onSubmit={handleCreate} className="space-y-4">
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                      required
                      placeholder="Subject"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <select
                        value={form.category}
                        onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 outline-none"
                      >
                        {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      </select>
                      <select
                        value={form.priority}
                        onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 outline-none"
                      >
                        {priorities.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                      </select>
                    </div>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                      required
                      rows={4}
                      placeholder="Describe your issue..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
                    >
                      {submitting ? 'Creating...' : 'Submit Ticket'}
                    </button>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tickets List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl bg-white/5" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <Card variant="glass" className="p-12 text-center">
                  <HelpCircle size={32} className="text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Tickets</h3>
                  <p className="text-white/40">No support tickets yet. Create one if you need help.</p>
                </Card>
              ) : (
                tickets.map((ticket, idx) => (
                  <motion.div key={ticket.id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <Card
                      variant="glass"
                      className="p-5 cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => setSelectedTicket(selectedTicket === ticket ? null : ticket)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-white/30 text-xs font-mono">{ticket.ticketId}</span>
                          <h3 className="text-white font-bold">{ticket.subject}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${statusColors[ticket.status] || statusColors.open}`}>
                            {ticket.status}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${priorityColors[ticket.priority] || priorityColors.medium}`}>
                            {ticket.priority}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/40">
                        <span className="capitalize">{ticket.category}</span>
                        <span>•</span>
                        <span>{timeSince(ticket.createdAt)}</span>
                        <span>•</span>
                        <span>{(ticket.messages || []).length} messages</span>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Ticket Thread Modal */}
          <AnimatePresence>
            {selectedTicket && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedTicket(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="w-full max-w-lg max-h-[80vh] flex flex-col bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="p-5 border-b border-white/10 shrink-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-bold">{selectedTicket.subject}</h3>
                        <p className="text-white/40 text-xs mt-1">{selectedTicket.ticketId} • {selectedTicket.category}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColors[selectedTicket.status]}`}>
                        {selectedTicket.status}
                      </span>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {(selectedTicket.messages || []).map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                          msg.sender === 'student'
                            ? 'bg-cyan-600/30 text-white'
                            : 'bg-white/10 text-white/80'
                        }`}>
                          <p>{msg.message}</p>
                          <p className="text-[10px] text-white/30 mt-1">{msg.sentAt ? timeSince(msg.sentAt) : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input */}
                  {selectedTicket.status !== 'closed' && (
                    <div className="p-4 border-t border-white/10 shrink-0 flex gap-3">
                      <input
                        type="text"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type a message..."
                        onKeyDown={(e) => e.key === 'Enter' && handleReply(selectedTicket.id || selectedTicket._id)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                      />
                      <button
                        onClick={() => handleReply(selectedTicket.id || selectedTicket._id)}
                        className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FAQ Section */}
          <Card variant="glass" className="overflow-hidden">
            <div className="p-5 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle size={20} className="text-amber-400" /> Frequently Asked Questions
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {faqs.map((faq, i) => (
                <div key={i}>
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === i ? null : i)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white/80 text-sm font-medium">{faq.q}</span>
                    {expandedFAQ === i ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                  </button>
                  <AnimatePresence>
                    {expandedFAQ === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 text-white/50 text-sm">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentSupport;
