import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  Search, Filter, ChevronLeft, ChevronRight, DollarSign, Clock, CheckCircle,
  Download, Mail, RefreshCcw, Settings, FileText, Plus, X, Calendar, CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import AdminSidebar from '../components/AdminSidebar';

const mockData = {
  revenue: 125000,
  pendingPayments: 15,
  successfulTransactions: 450,
  monthlyData: [
    { month: 'Jan', revenue: 15000 },
    { month: 'Feb', revenue: 25000 },
    { month: 'Mar', revenue: 20000 },
    { month: 'Apr', revenue: 30000 },
    { month: 'May', revenue: 22000 },
    { month: 'Jun', revenue: 28000 }
  ],
  batchData: [
    { name: 'Batch A', revenue: 45000 },
    { name: 'Batch B', revenue: 35000 },
    { name: 'Batch C', revenue: 25000 },
    { name: 'Batch D', revenue: 20000 }
  ],
  paymentStats: [
    { name: 'Successful', value: 85 },
    { name: 'Failed', value: 10 },
    { name: 'Pending', value: 5 }
  ],
  transactions: [
    {
      id: 'TRX001',
      studentName: 'Aarav Sharma',
      batch: 'Batch A',
      amount: 1200,
      method: 'Credit Card',
      date: '2024-03-15',
      status: 'Completed'
    },
    {
      id: 'TRX002',
      studentName: 'Priya Patel',
      batch: 'Batch B',
      amount: 1500,
      method: 'PayPal',
      date: '2024-03-14',
      status: 'Pending'
    },
    {
      id: 'TRX003',
      studentName: 'Rohan Gupta',
      batch: 'Batch A',
      amount: 1000,
      method: 'UPI',
      date: '2024-03-13',
      status: 'Failed'
    }
  ]
};

const PaymentAdmin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showStudentHistory, setShowStudentHistory] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return '#4CAF50';
      case 'pending': return '#FFC107';
      case 'failed': return '#F44336';
      default: return '#757575';
    }
  };

  const handleExport = (format) => {
    // Implementation for export functionality
    console.log(`Exporting in ${format} format`);
  };

  const handleSendReminder = (studentId) => {
    // Implementation for sending payment reminder
    console.log(`Sending reminder to student ${studentId}`);
  };

  const handleAddPayment = (paymentData) => {
    // Implementation for adding manual payment
    console.log('Adding payment:', paymentData);
    setShowAddPayment(false);
  };

  const PIE_COLORS = ['#4CAF50', '#F44336', '#FFC107'];

  return (
    <div className="min-h-screen bg-black text-white flex">
      <AdminSidebar />
      <div className="flex-1 p-6 space-y-6">
      {/* Summary Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div className="border border-bw-37 rounded-lg bg-black p-4 flex items-center gap-3" {...fadeIn}>
          <div className="w-10 h-10 rounded bg-bw-12 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
          <div className="card-content">
            <h3>Total Revenue</h3>
            <p>${mockData.revenue.toLocaleString()}</p>
          </div>
        </motion.div>

        <motion.div className="border border-bw-37 rounded-lg bg-black p-4 flex items-center gap-3" {...fadeIn}>
          <div className="w-10 h-10 rounded bg-bw-12 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div className="card-content">
            <h3>Pending Payments</h3>
            <p>{mockData.pendingPayments}</p>
          </div>
        </motion.div>

        <motion.div className="border border-bw-37 rounded-lg bg-black p-4 flex items-center gap-3" {...fadeIn}>
          <div className="w-10 h-10 rounded bg-bw-12 flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div className="card-content">
            <h3>Successful Transactions</h3>
            <p>{mockData.successfulTransactions}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          className="border border-bw-37 rounded-lg bg-black p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2>Revenue Trends</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          className="border border-bw-37 rounded-lg bg-black p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2>Batch Revenue</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.batchData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          className="border border-bw-37 rounded-lg bg-black p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2>Payment Status Distribution</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockData.paymentStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockData.paymentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Transactions Section */}
      <motion.div 
        className="border border-bw-37 rounded-lg bg-black p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="transactions-header">
          <h2>Recent Transactions</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 border border-bw-37 rounded px-3 py-2">
              <Search size={20} />
              <input 
                type="text" 
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 border border-bw-37 rounded px-3 py-2">
              <Filter size={20} />
              <select 
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-black focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex items-center gap-2 border border-bw-37 rounded px-3 py-2">
              <Calendar size={20} />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="bg-black focus:outline-none"
              />
              <span>to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="bg-black focus:outline-none"
              />
            </div>
            <button className="border border-bw-37 rounded px-3 py-2" onClick={() => setShowAddPayment(true)}>
              <Plus size={20} />
              Add Payment
            </button>
            <div className="flex items-center gap-2">
              <button className="border border-bw-37 rounded px-3 py-2" onClick={() => handleExport('csv')}>
                <FileText size={20} />
                CSV
              </button>
              <button className="border border-bw-37 rounded px-3 py-2" onClick={() => handleExport('pdf')}>
                <FileText size={20} />
                PDF
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-left">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Student Name</th>
                <th>Batch</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockData.transactions.map((transaction) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.01 }}
                  className="hover:bg-bw-12 transition-colors"
                >
                  <td>{transaction.id}</td>
                  <td>
                    <button 
                      className="border border-bw-37 rounded px-2 py-1"
                      onClick={() => {
                        setSelectedStudent(transaction);
                        setShowStudentHistory(true);
                      }}
                    >
                      {transaction.studentName}
                    </button>
                  </td>
                  <td>{transaction.batch}</td>
                  <td>${transaction.amount}</td>
                  <td>{transaction.method}</td>
                  <td>{format(new Date(transaction.date), 'MMM dd, yyyy')}</td>
                  <td>
                    <span 
                      className="px-2 py-1 rounded"
                      style={{ backgroundColor: getStatusColor(transaction.status) }}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="border border-bw-37 rounded p-2" onClick={() => handleSendReminder(transaction.id)}>
                        <Mail size={16} />
                      </button>
                      <button className="border border-bw-37 rounded p-2" onClick={() => console.log('Refund:', transaction.id)}>
                        <RefreshCcw size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={20} />
          </button>
          <span>Page {currentPage}</span>
          <button 
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage === 5}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </motion.div>

      {/* Add Payment Modal */}
      <AnimatePresence>
        {showAddPayment && (
          <motion.div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="border border-bw-37 bg-black text-white rounded-lg p-6 w-full max-w-xl"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="modal-header">
                <h2>Add Manual Payment</h2>
                <button onClick={() => setShowAddPayment(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="modal-content">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleAddPayment({
                    // Form data
                  });
                }}>
                  <div className="mb-3">
                    <label>Student Name</label>
                    <input type="text" required className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none" />
                  </div>
                  <div className="mb-3">
                    <label>Amount</label>
                    <input type="number" required className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none" />
                  </div>
                  <div className="mb-3">
                    <label>Payment Method</label>
                    <select required className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none">
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label>Batch</label>
                    <select required className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none">
                      <option value="batch-a">Batch A</option>
                      <option value="batch-b">Batch B</option>
                      <option value="batch-c">Batch C</option>
                    </select>
                  </div>
                  <button type="submit" className="border border-bw-37 rounded px-3 py-2">
                    Add Payment
                  </button>
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
            className="fixed inset-0 bg-black/60 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="border border-bw-37 bg-black text-white rounded-lg p-6 w-full max-w-xl"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="modal-header">
                <h2>{selectedStudent.studentName}&apos;s Payment History</h2>
                <button onClick={() => setShowStudentHistory(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="modal-content">
                <div className="student-history">
                  {/* Mock student history data */}
                  <div className="history-item">
                    <div className="history-icon">
                      <CreditCard size={24} />
                    </div>
                    <div className="history-details">
                      <h4>${selectedStudent.amount}</h4>
                      <p>{format(new Date(selectedStudent.date), 'MMM dd, yyyy')}</p>
                      <span className="px-2 py-1 rounded" style={{ backgroundColor: getStatusColor(selectedStudent.status) }}>
                        {selectedStudent.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default PaymentAdmin;