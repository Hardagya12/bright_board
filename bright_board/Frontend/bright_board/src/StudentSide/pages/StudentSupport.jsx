import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus, Send, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import api from '../../utils/api';

const categories = ['technical', 'payment', 'attendance', 'exam', 'other'];
const priorities = ['low', 'medium', 'high'];

const statusColors = {
  open: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'in-progress': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.15)]',
  closed: 'bg-white text-[#868685] border-[#e8ebe6]',
};

const priorityColors = {
  low: 'bg-white text-[#868685] border-[#e8ebe6]',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  high: 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(248,113,113,0.15)]',
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
    <div className="flex h-screen overflow-hidden bg-[#f9faf6] font-body relative">
      <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
            
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-[#e8ebe6] scrollbar-track-transparent relative z-10 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0e0f0c] font-display tracking-tight mb-2">Help & Support</h1>
              <p className="text-[#868685] tracking-wide mt-2">Raise tickets and get help from your tutor or administrators.</p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className={`px-6 py-3.5 rounded-full font-bold tracking-wide transition-all flex items-center gap-3 ${showForm ? 'bg-white border border-[#e8ebe6] text-[#0e0f0c]' : 'btn-primary shadow-[0_0_20px_rgba(0,245,255,0.2)]'}`}
            >
              <Plus size={18} className={showForm ? 'rotate-45 transition-transform' : 'transition-transform'} /> {showForm ? 'Cancel' : 'New Ticket'}
            </Button>
          </div>

          {/* Create Ticket Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-10 md:p-12 mb-8 accent-top-purple shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                  <h3 className="text-2xl font-bold text-[#0e0f0c] font-display tracking-tight mb-8">Create Support Ticket</h3>
                  <form onSubmit={handleCreate} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[#868685] text-[10px] font-bold uppercase tracking-widest ml-1">Subject</label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                        required
                        placeholder="Brief summary of your issue..."
                        className="w-full bg-white border border-[#e8ebe6] rounded-full px-6 py-3.5 text-sm font-medium tracking-wide text-[#0e0f0c] outline-none focus:border-cyan-400 focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] transition-all shadow-inner"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[#868685] text-[10px] font-bold uppercase tracking-widest ml-1">Category</label>
                         <select
                           value={form.category}
                           onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                           className="w-full bg-white border border-[#e8ebe6] rounded-full px-6 py-3.5 text-sm font-medium tracking-wide text-[#0e0f0c] outline-none focus:border-cyan-400 focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] transition-all shadow-inner custom-select appearance-none cursor-pointer pr-10"
                           style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem top 50%', backgroundSize: '0.65rem auto' }}
                         >
                           {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[#868685] text-[10px] font-bold uppercase tracking-widest ml-1">Priority</label>
                         <select
                           value={form.priority}
                           onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}
                           className="w-full bg-white border border-[#e8ebe6] rounded-full px-6 py-3.5 text-sm font-medium tracking-wide text-[#0e0f0c] outline-none focus:border-cyan-400 focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] transition-all shadow-inner custom-select appearance-none cursor-pointer pr-10"
                           style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem top 50%', backgroundSize: '0.65rem auto' }}
                         >
                           {priorities.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                         </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[#868685] text-[10px] font-bold uppercase tracking-widest ml-1">Description</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                        required
                        rows={5}
                        placeholder="Please provide details about your issue..."
                        className="w-full bg-white border border-[#e8ebe6] rounded-[24px] px-6 py-4 text-sm font-medium tracking-wide text-[#0e0f0c] outline-none resize-none focus:border-cyan-400 focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] transition-all shadow-inner"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 btn-primary rounded-full font-bold tracking-wide shadow-[0_0_30px_rgba(0,245,255,0.3)] transition-all mt-6"
                    >
                      {submitting ? 'Creating Ticket...' : 'Submit Support Ticket'}
                    </Button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tickets List */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-[#0e0f0c] font-display tracking-tight">Your Tickets</h2>
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-[24px] bg-white" />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.length === 0 ? (
                    <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-12 text-center border-dashed border-[#e8ebe6]">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 border border-[#e8ebe6] shadow-inner">
                        <HelpCircle size={32} className="text-[#e8ebe6]" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0e0f0c] mb-2 font-display">No Tickets</h3>
                      <p className="text-[#868685] tracking-wide text-sm font-medium">No support tickets yet. Create one if you need help.</p>
                    </div>
                  ) : (
                    tickets.map((ticket, idx) => (
                      <motion.div key={ticket.id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                        <div
                          className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-6 cursor-pointer hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
                          onClick={() => setSelectedTicket(selectedTicket === ticket ? null : ticket)}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-[12px] bg-white border border-[#e8ebe6] flex items-center justify-center shadow-inner group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-colors">
                                 <MessageCircle size={18} />
                              </div>
                              <div>
                                <h3 className="text-[#0e0f0c] font-bold tracking-wide text-lg group-hover:text-cyan-400 transition-colors">{ticket.subject}</h3>
                                <span className="text-cyan-400/60 text-[10px] font-bold uppercase tracking-widest">{ticket.ticketId}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-inner ${statusColors[ticket.status] || statusColors.open}`}>
                                {ticket.status}
                              </span>
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-inner ${priorityColors[ticket.priority] || priorityColors.medium}`}>
                                {ticket.priority}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[#868685] bg-white p-3 rounded-[12px] border border-[#e8ebe6]">
                            <span className="text-cyan-400">{ticket.category}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <span>{timeSince(ticket.createdAt)}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <span className="flex items-center gap-1.5"><MessageCircle size={12}/> {(ticket.messages || []).length}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* FAQ Section */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm overflow-hidden sticky top-8 accent-top-cyan shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                <div className="p-6 border-b border-[#e8ebe6] bg-white/[0.02]">
                  <h3 className="text-lg font-bold text-[#0e0f0c] flex items-center gap-3 font-display tracking-wide">
                    <HelpCircle size={24} className="text-cyan-400" /> FAQ
                  </h3>
                </div>
                <div className="divide-y divide-white/5 custom-scrollbar max-h-[60vh] overflow-y-auto">
                  {faqs.map((faq, i) => (
                    <div key={i}>
                      <button
                        onClick={() => setExpandedFAQ(expandedFAQ === i ? null : i)}
                        className="w-full p-5 flex items-start justify-between text-left hover:bg-white/[0.04] transition-colors gap-4"
                      >
                        <span className="text-[#0e0f0c]/80 text-sm font-bold tracking-wide leading-relaxed">{faq.q}</span>
                        <div className="w-6 h-6 shrink-0 rounded-full bg-white flex items-center justify-center border border-[#e8ebe6] mt-0.5">
                          {expandedFAQ === i ? <ChevronUp size={14} className="text-[#868685]" /> : <ChevronDown size={14} className="text-[#868685]" />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {expandedFAQ === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-white"
                          >
                            <p className="px-5 pb-5 pt-2 text-[#868685] text-sm font-medium tracking-wide leading-relaxed">{faq.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Thread Modal */}
          <AnimatePresence>
            {selectedTicket && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#f9faf6]/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 font-body"
                onClick={() => setSelectedTicket(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  className="w-full max-w-2xl h-[85vh] flex flex-col bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm border border-cyan-400/30 rounded-[32px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="p-6 md:p-8 border-b border-[#e8ebe6] shrink-0 bg-white/[0.02] relative">
                    <div className="absolute top-0 left-10 right-10 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 blur-sm rounded-full"></div>
                    <button onClick={() => setSelectedTicket(null)} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white border border-[#e8ebe6] flex items-center justify-center text-[#868685] hover:text-[#0e0f0c] hover:bg-[#e2f6d5] transition-colors">✕</button>
                    <div className="pr-12">
                      <div className="flex items-center gap-4 mb-3">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-inner ${statusColors[selectedTicket.status]}`}>
                          {selectedTicket.status}
                        </span>
                         <span className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest">{selectedTicket.category}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-[#0e0f0c] font-display tracking-tight mb-1">{selectedTicket.subject}</h3>
                      <p className="text-[#868685] text-[10px] font-bold uppercase tracking-widest">{selectedTicket.ticketId}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar bg-white">
                    {(selectedTicket.messages || []).map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-5 rounded-[24px] text-sm shadow-inner ${
                          msg.sender === 'student'
                            ? 'bg-cyan-500/20 text-[#0e0f0c] border border-cyan-400/30 rounded-br-sm'
                            : 'bg-white text-[#0e0f0c]/80 border border-[#e8ebe6] rounded-bl-sm'
                        }`}>
                          <p className="leading-relaxed font-medium tracking-wide">{msg.message}</p>
                          <p className={`text-[10px] font-bold uppercase tracking-widest mt-3 ${msg.sender === 'student' ? 'text-cyan-400/60 text-right' : 'text-[#868685]'}`}>{msg.sentAt ? timeSince(msg.sentAt) : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input */}
                  {selectedTicket.status !== 'closed' && (
                    <div className="p-6 shrink-0 bg-white/[0.02] border-t border-[#e8ebe6]">
                      <div className="flex gap-4">
                        <input
                          type="text"
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          placeholder="Type your reply..."
                          onKeyDown={(e) => e.key === 'Enter' && handleReply(selectedTicket.id || selectedTicket._id)}
                          className="flex-1 bg-black/40 border border-[#e8ebe6] rounded-full px-6 py-4 text-sm font-medium tracking-wide text-[#0e0f0c] outline-none focus:border-cyan-400 focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] transition-all shadow-inner"
                        />
                        <button
                          onClick={() => handleReply(selectedTicket.id || selectedTicket._id)}
                          className="w-14 h-14 shrink-0 rounded-full btn-primary flex items-center justify-center shadow-[0_0_20px_rgba(0,245,255,0.3)] transition-transform hover:scale-105 active:scale-95"
                        >
                          <Send size={20} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default StudentSupport;
