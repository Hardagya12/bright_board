import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  Search, Filter, ChevronLeft, ChevronRight, DollarSign, Clock, CheckCircle,
  Download, Mail, RefreshCcw, Settings, FileText, Plus, X, Calendar, CreditCard, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { format } from 'date-fns';
import AdminSidebar from '../components/AdminSidebar';
import { getPaymentsSummary, listTransactions, addPayment } from '../../utils/services/payments';
import Button from '../../components/ui/Button';


const PIE_COLORS = ['#10B981', '#EF4444', '#F59E0B'];

const PaymentAdmin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showStudentHistory, setShowStudentHistory] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentHistory, setStudentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [summary, setSummary] = useState({ revenue: 0, pendingPayments: 0, successfulTransactions: 0, monthlyData: [], batchData: [], paymentStats: [] });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: sum } = await getPaymentsSummary();
        setSummary(sum);
        const params = {};
        if (selectedFilter !== 'all') params.status = selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1);
        if (dateRange.start) params.start = dateRange.start;
        if (dateRange.end) params.end = dateRange.end;
        const { data: tx } = await listTransactions(params);
        setTransactions(tx.transactions || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedFilter, dateRange.start, dateRange.end]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-emerald-500/10 text-[#9fe870] border-emerald-500/20 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]';
      case 'pending': return 'bg-amber-500/10 text-[#9fe870] border-amber-500/20 shadow-[inset_0_0_15px_rgba(245,158,11,0.1)]';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]';
      default: return 'bg-white text-[#868685] border-[#e8ebe6]';
    }
  };

  const handleExport = (format) => {
    // TODO: Implement export functionality
  };

  const handleSendReminder = (studentId) => {
    // TODO: Implement reminder functionality
  };

  const handleAddPayment = async (paymentData) => {
    try {
      await addPayment(paymentData);
      setShowAddPayment(false);
    } catch (err) {
      console.error('Add payment failed', err);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color, accent }) => (
    <div className={`bb-card p-6 relative group ${accent}`}>
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity duration-500 ${color === 'success' ? 'text-emerald-500' :
          color === 'warning' ? 'text-amber-500' : 'text-[#9fe870]'
        }`}>
        <Icon size={80} className="transform rotate-12" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-xl bg-white  border border-[#e8ebe6] ${color === 'success' ? 'text-[#9fe870]' :
              color === 'warning' ? 'text-[#9fe870]' : 'text-[#9fe870]'
            }`}>
            <Icon size={20} />
          </div>
          <span className="text-[#868685] font-medium text-sm tracking-wide">{title}</span>
        </div>
        <div className="text-4xl font-bold text-[#0e0f0c] tracking-tight mb-2 drop-shadow-md">
          {typeof value === 'number' && title.includes('Revenue') ? `$${value.toLocaleString()}` : value}
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${trend > 0 ? 'text-[#9fe870]' : 'text-red-400'}`}>
            <div className={`p-1 rounded-full mr-2 ${trend > 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
              {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            </div>
            <span className="opacity-80">{Math.abs(trend)}% vs last month</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bb-offwhite)] font-body relative">
      <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
      
      <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vh] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent relative z-10">
        <div className="max-w-7xl mx-auto space-y-10">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0e0f0c] tracking-tight mb-2 font-display">Payment Intelligence</h1>
              <p className="text-[#868685] tracking-wide">Track revenue streams, transactions, and pending settlements.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => handleExport('csv')} className="bg-white border border-[#e8ebe6] hover:bg-white/10 text-[#0e0f0c] rounded-full px-6 transition-all duration-300">
                <Download size={18} className="mr-2" /> Export CSV
              </Button>
              <Button onClick={() => setShowAddPayment(true)} className="btn-primary flex items-center shadow-glow-cyan px-6">
                <Plus size={18} className="mr-2" /> Inject Funds
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Revenue"
              value={summary.revenue}
              icon={DollarSign}
              color="success"
              trend={12.5}
              accent="accent-top-green"
            />
            <StatCard
              title="Pending Payments"
              value={summary.pendingPayments}
              icon={Clock}
              color="warning"
              trend={-2.4}
              accent="bb-card-accent"
            />
            <StatCard
              title="Successful Transactions"
              value={summary.successfulTransactions}
              icon={CheckCircle}
              color="primary"
              trend={8.1}
              accent="bb-card-accent"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bb-card lg:col-span-2 h-[420px] p-6 bb-card-accent">
              <h3 className="text-lg font-bold text-[#0e0f0c] mb-6 tracking-wide font-display">Revenue Velocity</h3>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={summary.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15,15,26,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#ffd11a' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ffd11a"
                    strokeWidth={4}
                    dot={{ fill: '#08080f', stroke: '#ffd11a', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8, fill: '#ffd11a', stroke: '#fff', strokeWidth: 2 }}
                    style={{ filter: 'drop-shadow(0 0 8px rgba(0,245,255,0.5))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bb-card h-[420px] p-6 bb-card-accent">
              <h3 className="text-lg font-bold text-[#0e0f0c] mb-6 tracking-wide font-display">Status Matrix</h3>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={summary.paymentStats || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {(summary.paymentStats || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} style={{ filter: `drop-shadow(0 0 10px ${PIE_COLORS[index % PIE_COLORS.length]}60)` }} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15,15,26,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bb-card overflow-hidden">
            <div className="p-6 border-b border-white/5 flex flex-wrap gap-4 justify-between items-center bg-white/[0.02]">
              <h3 className="text-lg font-bold text-[#0e0f0c] font-display">Ledger Stream</h3>
              <div className="flex gap-4 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#868685]" size={18} />
                  <input
                    type="text"
                    placeholder="Search query..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#f9faf6] border border-[#e8ebe6] rounded-full pl-11 pr-5 py-2.5 text-sm text-[#0e0f0c] focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,245,255,0.15)] outline-none transition-all w-64"
                  />
                </div>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="bg-[#f9faf6] border border-[#e8ebe6] rounded-full px-5 py-2.5 text-sm text-[#0e0f0c] focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,245,255,0.15)] outline-none transition-all appearance-none pr-10"
                >
                  <option value="all">All States</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <div className="flex items-center gap-3 bg-[#f9faf6] border border-[#e8ebe6] rounded-full px-5 py-2.5 transition-all focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(0,245,255,0.15)]">
                  <Calendar size={18} className="text-[#868685]" />
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="bg-transparent text-sm text-[#0e0f0c] outline-none w-[110px]"
                  />
                  <span className="text-[#e8ebe6]">-</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="bg-transparent text-sm text-[#0e0f0c] outline-none w-[110px]"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f9faf6] text-[#868685] text-xs uppercase tracking-widest font-medium border-b border-white/5">
                  <tr>
                    <th className="px-6 py-5">Tx Hash</th>
                    <th className="px-6 py-5">Identity</th>
                    <th className="px-6 py-5">Node Cluster</th>
                    <th className="px-6 py-5">Value</th>
                    <th className="px-6 py-5">Timestamp</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Directives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {transactions.map((transaction) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/[0.04] transition-colors duration-300 group"
                    >
                      <td className="px-6 py-5 text-sm text-[#868685] font-mono tracking-wider">{transaction.id}</td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => {
                            setSelectedStudent(transaction);
                            setShowStudentHistory(true);
                            (async () => {
                              setHistoryLoading(true);
                              try {
                                const { data } = await listTransactions({ studentName: transaction.studentName });
                                setStudentHistory(data.transactions || []);
                              } catch { }
                              setHistoryLoading(false);
                            })();
                          }}
                          className="text-[#0e0f0c] font-medium hover:text-[#9fe870] transition-colors drop-shadow-sm"
                        >
                          {transaction.studentName}
                        </button>
                      </td>
                      <td className="px-6 py-5 text-sm text-[#454745]">{transaction.batch}</td>
                      <td className="px-6 py-5 font-bold text-[#0e0f0c] text-lg tracking-tight drop-shadow-sm">${transaction.amount}</td>
                      <td className="px-6 py-5 text-sm text-[#868685]">{format(new Date(transaction.date), 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button className="p-2.5 bg-white hover:bg-cyan-500/10 rounded-full border border-white/5 hover:border-cyan-500/30 text-[#868685] hover:text-[#9fe870] transition-all shadow-lg" onClick={() => handleSendReminder(transaction.id)}>
                            <Mail size={16} />
                          </button>
                          <button className="p-2.5 bg-white hover:bg-emerald-500/10 rounded-full border border-white/5 hover:border-[#163300]/30 text-[#868685] hover:text-[#9fe870] transition-all shadow-lg" onClick={() => { /* TODO: Implement refund */ }}>
                            <RefreshCcw size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Modal */}
      <AnimatePresence>
        {showAddPayment && (
          <motion.div
            className="fixed inset-0 bg-[var(--bb-offwhite)]/60  z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#0f0f1a]/80 backdrop-blur-2xl border border-[#e8ebe6] rounded-[24px] w-full max-w-lg overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] relative"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
            >
              <div className="absolute top-0 left-10 right-10 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-50 blur-sm rounded-full"></div>
              
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center relative z-10">
                <h2 className="text-2xl font-bold text-[#0e0f0c] font-display tracking-tight">Manual Injection</h2>
                <button onClick={() => setShowAddPayment(false)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#868685] hover:text-[#0e0f0c] hover:bg-white/10 transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 relative z-10">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleAddPayment({});
                }} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#868685] uppercase tracking-widest ml-1">Entity Identity</label>
                    <input type="text" required className="w-full bg-[var(--bb-offwhite)]/30 border border-[#e8ebe6] rounded-xl px-5 py-3.5 text-[#0e0f0c] focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,245,255,0.15)] outline-none transition-all placeholder:text-[#e8ebe6]" placeholder="Student Name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#868685] uppercase tracking-widest ml-1">Transfer Value</label>
                    <input type="number" required className="w-full bg-[var(--bb-offwhite)]/30 border border-[#e8ebe6] rounded-xl px-5 py-3.5 text-[#0e0f0c] focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,245,255,0.15)] outline-none transition-all placeholder:text-[#e8ebe6]" placeholder="0.00" />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#868685] uppercase tracking-widest ml-1">Protocol</label>
                      <select required className="w-full bg-[var(--bb-offwhite)]/30 border border-[#e8ebe6] rounded-xl px-5 py-3.5 text-[#0e0f0c] focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,245,255,0.15)] outline-none transition-all appearance-none font-medium">
                        <option value="cash">FIAT_CASH</option>
                        <option value="card">CREDIT_NODE</option>
                        <option value="upi">DIGITAL_UPI</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#868685] uppercase tracking-widest ml-1">Cluster</label>
                      <select required className="w-full bg-[var(--bb-offwhite)]/30 border border-[#e8ebe6] rounded-xl px-5 py-3.5 text-[#0e0f0c] focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,245,255,0.15)] outline-none transition-all appearance-none font-medium">
                        <option value="batch-a">Cluster_Alpha</option>
                        <option value="batch-b">Cluster_Beta</option>
                        <option value="batch-c">Cluster_Gamma</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-6 flex justify-end gap-4 border-t border-white/5">
                    <Button onClick={() => setShowAddPayment(false)} className="bg-transparent border border-[#e8ebe6] hover:bg-white text-[#0e0f0c] rounded-full px-8 py-3 transition-all duration-300">Abort</Button>
                    <Button type="submit" className="btn-primary shadow-glow-cyan px-8 py-3 rounded-full font-bold tracking-wide">Execute Transfer</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student History Modal */}
      <AnimatePresence>
        {showStudentHistory && selectedStudent && (
          <motion.div
            className="fixed inset-0 bg-[var(--bb-offwhite)]/60  z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#0f0f1a]/80 backdrop-blur-2xl border border-[#e8ebe6] rounded-[24px] w-full max-w-lg overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] relative"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
            >
              <div className="absolute top-0 left-10 right-10 h-1 bg-gradient-to-r from-purple-400 to-cyan-500 opacity-50 blur-sm rounded-full"></div>
              
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div>
                  <h2 className="text-2xl font-bold text-[#0e0f0c] font-display tracking-tight">{selectedStudent.studentName}</h2>
                  <p className="text-[#9fe870]/80 text-xs font-mono uppercase tracking-widest mt-1">Transaction History Log</p>
                </div>
                <button onClick={() => setShowStudentHistory(false)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#868685] hover:text-[#0e0f0c] hover:bg-white/10 transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar relative">
                {historyLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin"></div>
                    <div className="text-[#9fe870]/50 text-xs font-mono uppercase tracking-widest animate-pulse">Extracting Records...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studentHistory.map(h => (
                      <div key={h.id} className="flex items-center gap-5 p-5 rounded-[16px] bg-white/[0.03] border border-white/5 hover:border-[#e8ebe6] transition-colors">
                        <div className="p-3.5 rounded-xl bg-cyan-500/10 text-[#9fe870] border border-cyan-500/20 shadow-[inset_0_0_15px_rgba(0,245,255,0.1)]">
                          <CreditCard size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1.5">
                            <h4 className="font-bold text-[#0e0f0c] text-lg tracking-tight">${h.amount}</h4>
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest border ${getStatusColor(h.status)}`}>
                              {h.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#868685] font-medium">{format(new Date(h.date), 'MMM dd, yyyy')} • <span className="uppercase text-[#868685] tracking-wider text-[10px]">{h.method}</span></p>
                        </div>
                      </div>
                    ))}
                    {studentHistory.length === 0 && (
                      <div className="text-center text-[#868685] py-12 font-mono text-sm uppercase tracking-widest">Null Output. No Tx Found.</div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentAdmin;