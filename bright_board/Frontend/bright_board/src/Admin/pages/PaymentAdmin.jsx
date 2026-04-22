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
import Card from '../../components/ui/Card';
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

  // ... (keep existing useEffect and helper functions)
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
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-white/5 text-white/60 border-white/10';
    }
  };

  const handleExport = (format) => {
    console.log(`Exporting in ${format} format`);
  };

  const handleSendReminder = (studentId) => {
    console.log(`Sending reminder to student ${studentId}`);
  };

  const handleAddPayment = async (paymentData) => {
    try {
      await addPayment(paymentData);
      setShowAddPayment(false);
    } catch (err) {
      console.error('Add payment failed', err);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color }) => (
    <Card variant="glass" className="relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color === 'success' ? 'text-emerald-500' :
          color === 'warning' ? 'text-amber-500' : 'text-blue-500'
        }`}>
        <Icon size={64} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg bg-white/5 ${color === 'success' ? 'text-emerald-400' :
              color === 'warning' ? 'text-amber-400' : 'text-blue-400'
            }`}>
            <Icon size={20} />
          </div>
          <span className="text-white/60 font-medium text-sm">{title}</span>
        </div>
        <div className="text-3xl font-bold text-white tracking-tight mb-1">
          {typeof value === 'number' && title.includes('Revenue') ? `$${value.toLocaleString()}` : value}
        </div>
        {trend && (
          <div className={`flex items-center text-xs ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span className="ml-1">{Math.abs(trend)}% vs last month</span>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Payment Management</h1>
              <p className="text-white/50">Track revenue, transactions and payments.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => handleExport('csv')}>
                <Download size={18} className="mr-2" /> Export CSV
              </Button>
              <Button variant="accent" onClick={() => setShowAddPayment(true)}>
                <Plus size={18} className="mr-2" /> Add Payment
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
            />
            <StatCard
              title="Pending Payments"
              value={summary.pendingPayments}
              icon={Clock}
              color="warning"
              trend={-2.4}
            />
            <StatCard
              title="Successful Transactions"
              value={summary.successfulTransactions}
              icon={CheckCircle}
              color="primary"
              trend={8.1}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card variant="glass" className="lg:col-span-2 h-[400px]">
              <h3 className="text-lg font-semibold text-white mb-6">Revenue Trends</h3>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={summary.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="month" stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card variant="glass" className="h-[400px]">
              <h3 className="text-lg font-semibold text-white mb-6">Payment Status</h3>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={summary.paymentStats || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(summary.paymentStats || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card variant="glass" className="p-0 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex flex-wrap gap-4 justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
              <div className="flex gap-3 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                  />
                </div>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <Calendar size={16} className="text-white/40" />
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="bg-transparent text-sm text-white outline-none w-28"
                  />
                  <span className="text-white/40">-</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="bg-transparent text-sm text-white outline-none w-28"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium border-b border-white/10">Transaction ID</th>
                    <th className="px-6 py-4 font-medium border-b border-white/10">Student</th>
                    <th className="px-6 py-4 font-medium border-b border-white/10">Batch</th>
                    <th className="px-6 py-4 font-medium border-b border-white/10">Amount</th>
                    <th className="px-6 py-4 font-medium border-b border-white/10">Date</th>
                    <th className="px-6 py-4 font-medium border-b border-white/10">Status</th>
                    <th className="px-6 py-4 font-medium border-b border-white/10">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((transaction) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4 text-sm text-white/70 font-mono">{transaction.id}</td>
                      <td className="px-6 py-4">
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
                          className="text-white font-medium hover:text-blue-400 transition-colors"
                        >
                          {transaction.studentName}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/70">{transaction.batch}</td>
                      <td className="px-6 py-4 font-medium text-white">${transaction.amount}</td>
                      <td className="px-6 py-4 text-sm text-white/70">{format(new Date(transaction.date), 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-blue-400 transition-colors" onClick={() => handleSendReminder(transaction.id)}>
                            <Mail size={16} />
                          </button>
                          <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-emerald-400 transition-colors" onClick={() => console.log('Refund:', transaction.id)}>
                            <RefreshCcw size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Payment Modal */}
      <AnimatePresence>
        {showAddPayment && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
            >
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold text-white">Add Manual Payment</h2>
                <button onClick={() => setShowAddPayment(false)} className="text-white/50 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleAddPayment({});
                }} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Student Name</label>
                    <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Amount</label>
                    <input type="number" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Method</label>
                      <select required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none">
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Batch</label>
                      <select required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none">
                        <option value="batch-a">Batch A</option>
                        <option value="batch-b">Batch B</option>
                        <option value="batch-c">Batch C</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setShowAddPayment(false)}>Cancel</Button>
                    <Button type="submit" variant="accent">Add Payment</Button>
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
            >
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold text-white">{selectedStudent.studentName}'s History</h2>
                <button onClick={() => setShowStudentHistory(false)} className="text-white/50 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {historyLoading ? (
                  <div className="text-center text-white/40 py-8">Loading history...</div>
                ) : (
                  <div className="space-y-3">
                    {studentHistory.map(h => (
                      <div key={h.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="p-3 rounded-full bg-blue-500/10 text-blue-400">
                          <CreditCard size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold text-white">${h.amount}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(h.status)}`}>
                              {h.status}
                            </span>
                          </div>
                          <p className="text-xs text-white/50">{format(new Date(h.date), 'MMM dd, yyyy')} • {h.method}</p>
                        </div>
                      </div>
                    ))}
                    {studentHistory.length === 0 && (
                      <div className="text-center text-white/40 py-8">No transactions found.</div>
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