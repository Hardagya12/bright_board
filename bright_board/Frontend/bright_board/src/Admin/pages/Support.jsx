import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Search, ChevronDown, X, CheckCircle2, HelpCircle, Clock, AlertCircle } from 'lucide-react';
import { FaTicketAlt, FaClock } from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import api from '../../utils/api';
import { listTickets, createTicket } from '../../utils/services/support';

const statusColors = {
  open: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'in-progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  closed: 'bg-white/10 text-white/50 border-white/10',
};

const priorityColors = {
  low: 'bg-white/5 text-white/50',
  medium: 'bg-amber-500/10 text-amber-400',
  high: 'bg-red-500/10 text-red-400',
};

const Support = () => {
  const [activeTab, setActiveTab] = useState('student-tickets');
  const [studentTickets, setStudentTickets] = useState([]);
  const [ownTickets, setOwnTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Create ticket form
  const [form, setForm] = useState({ subject: '', message: '', category: 'general' });
  const [banner, setBanner] = useState({ open: false, message: '' });

  const loadStudentTickets = async () => {
    try {
      const { data } = await api.get('/support/student-tickets');
      setStudentTickets(data.tickets || []);
    } catch (err) { console.error(err); }
  };

  const loadOwnTickets = async () => {
    try {
      const { data } = await listTickets();
      setOwnTickets(data.tickets || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadStudentTickets(), loadOwnTickets()]).finally(() => setLoading(false));
  }, []);

  const handleReply = async (ticketId) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/support/student-tickets/${ticketId}/reply`, { message: replyText });
      setReplyText('');
      loadStudentTickets();
      // Update selected ticket messages inline
      if (selectedTicket) {
        setSelectedTicket(prev => ({
          ...prev,
          messages: [...(prev.messages || []), { sender: 'tutor', message: replyText, sentAt: new Date() }],
        }));
      }
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const handleStatusChange = async (ticketId, status) => {
    try {
      await api.put(`/support/student-tickets/${ticketId}/status`, { status });
      loadStudentTickets();
    } catch (err) { console.error(err); }
  };

  const submitOwnTicket = async (e) => {
    e.preventDefault();
    try {
      await createTicket(form);
      setForm({ subject: '', message: '', category: 'general' });
      loadOwnTickets();
      setBanner({ open: true, message: 'Ticket created!' });
      setTimeout(() => setBanner({ open: false, message: '' }), 3000);
    } catch (err) { console.error(err); }
  };

  const filtered = (activeTab === 'student-tickets' ? studentTickets : ownTickets).filter(t =>
    !searchTerm || t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || t.ticketId?.includes(searchTerm)
  );

  const timeSince = (date) => {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return 'Today';
    if (d === 1) return 'Yesterday';
    if (d < 7) return `${d}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-5xl mx-auto space-y-8">

          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Support Center</h1>
            <p className="text-white/50">Manage student support tickets and submit your own requests.</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-white/5 rounded-xl p-1">
            {[
              { key: 'student-tickets', label: `Student Tickets (${studentTickets.length})` },
              { key: 'my-tickets', label: `My Tickets (${ownTickets.length})` },
              { key: 'create', label: 'Create Ticket' },
            ].map(tab => (
              <button key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Student Tickets / My Tickets */}
          {(activeTab === 'student-tickets' || activeTab === 'my-tickets') && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tickets..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none" />
              </div>

              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)}</div>
              ) : filtered.length === 0 ? (
                <Card variant="glass" className="p-12 text-center">
                  <HelpCircle size={32} className="text-white/20 mx-auto mb-4" />
                  <p className="text-white/40">No tickets found.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filtered.map((ticket, idx) => (
                    <motion.div key={ticket.id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card variant="glass" className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => { setSelectedTicket(ticket); setReplyText(''); }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-white/30 text-xs font-mono">{ticket.ticketId || ticket.id?.slice(-6)}</span>
                            <h3 className="text-white font-bold text-sm">{ticket.subject}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            {ticket.priority && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${priorityColors[ticket.priority] || ''}`}>{ticket.priority}</span>}
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${statusColors[ticket.status] || statusColors.open}`}>{ticket.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/40">
                          {ticket.studentName && <span>👤 {ticket.studentName}</span>}
                          <span className="capitalize">{ticket.category}</span>
                          <span>•</span>
                          <span>{timeSince(ticket.createdAt)}</span>
                          <span>•</span>
                          <span>{(ticket.messages || ticket.replies || []).length} msgs</span>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Create Ticket */}
          {activeTab === 'create' && (
            <Card variant="glass" className="max-w-2xl mx-auto p-8">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">New Support Ticket</h2>
                  <p className="text-sm text-white/50">Submit a request to the platform team.</p>
                </div>
              </div>
              <form onSubmit={submitOwnTicket} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Subject</label>
                  <input type="text" value={form.subject} onChange={(e) => setForm(f => ({...f, subject: e.target.value}))} required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none" placeholder="Brief summary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Category</label>
                  <select value={form.category} onChange={(e) => setForm(f => ({...f, category: e.target.value}))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none appearance-none">
                    <option value="general">General</option><option value="technical">Technical</option><option value="billing">Billing</option><option value="feature-request">Feature Request</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Message</label>
                  <textarea rows={5} value={form.message} onChange={(e) => setForm(f => ({...f, message: e.target.value}))} required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none resize-none" placeholder="Describe your issue..." />
                </div>
                <Button variant="accent" type="submit" className="w-full py-3"><Send size={18} className="mr-2" /> Submit Ticket</Button>
              </form>
            </Card>
          )}

        </div>
      </div>

      {/* Ticket Thread Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTicket(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg max-h-[80vh] flex flex-col bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="p-5 border-b border-white/10 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-bold">{selectedTicket.subject}</h3>
                  <button onClick={() => setSelectedTicket(null)} className="text-white/40 hover:text-white"><X size={20} /></button>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  {selectedTicket.studentName && <span>👤 {selectedTicket.studentName}</span>}
                  <span>{selectedTicket.ticketId || ''}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize border ${statusColors[selectedTicket.status] || ''}`}>{selectedTicket.status}</span>
                </div>
                {/* Status buttons */}
                {activeTab === 'student-tickets' && (
                  <div className="flex gap-2 mt-3">
                    {['open', 'in-progress', 'resolved', 'closed'].map(st => (
                      <button key={st} onClick={() => { handleStatusChange(selectedTicket.id, st); setSelectedTicket(prev => ({...prev, status: st})); }}
                        className={`px-2 py-1 rounded text-[10px] font-bold capitalize transition-colors ${
                          selectedTicket.status === st ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-white/40 hover:text-white'
                        }`}>{st}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(selectedTicket.messages || selectedTicket.replies || []).map((msg, i) => (
                  <div key={i} className={`flex ${(msg.sender === 'tutor' || msg.from === 'institute') ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                      (msg.sender === 'tutor' || msg.from === 'institute')
                        ? 'bg-cyan-600/30 text-white'
                        : 'bg-white/10 text-white/80'
                    }`}>
                      <p>{msg.message}</p>
                      <p className="text-[10px] text-white/30 mt-1">{timeSince(msg.sentAt || msg.createdAt)}</p>
                    </div>
                  </div>
                ))}
                {/* Show initial description if no messages array */}
                {!selectedTicket.messages && selectedTicket.message && (
                  <div className="p-3 rounded-xl bg-white/10 text-white/80 text-sm">{selectedTicket.message}</div>
                )}
              </div>

              {/* Reply Input - only for student tickets */}
              {activeTab === 'student-tickets' && selectedTicket.status !== 'closed' && (
                <div className="p-4 border-t border-white/10 shrink-0 flex gap-3">
                  <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a reply..." onKeyDown={(e) => e.key === 'Enter' && handleReply(selectedTicket.id)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
                  <button onClick={() => handleReply(selectedTicket.id)} disabled={submitting || !replyText.trim()}
                    className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl transition-colors">
                    <Send size={16} />
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner */}
      <AnimatePresence>
        {banner.open && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50 bg-[#121212] border border-emerald-500/20 rounded-xl shadow-2xl p-4 flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <span className="text-white font-medium">{banner.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Support;