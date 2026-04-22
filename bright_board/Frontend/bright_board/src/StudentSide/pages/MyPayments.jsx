import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, AlertTriangle, CheckCircle, Clock, DollarSign, Receipt, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../utils/api';

const MyPayments = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ totalPaid: 0, totalPending: 0, totalRecords: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/student/payments');
        setPayments(data.payments || []);
        setSummary(data.summary || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const groupedByMonth = payments.reduce((acc, p) => {
    const month = p.date ? p.date.substring(0, 7) : 'Unknown';
    if (!acc[month]) acc[month] = [];
    acc[month].push(p);
    return acc;
  }, {});

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">My Payments</h1>
            <p className="text-white/50">View your fee records and pending dues.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl bg-white/5" />)}
            </div>
          ) : (
            <>
              {/* Pending Dues Alert */}
              {summary.totalPending > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
                >
                  <AlertTriangle className="text-red-400 shrink-0" size={20} />
                  <p className="text-red-400 text-sm font-medium">
                    You have ₹{summary.totalPending.toLocaleString()} pending fees. Please contact your tutor.
                  </p>
                </motion.div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Amount Paid', value: `₹${summary.totalPaid.toLocaleString()}`, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Pending Dues', value: `₹${summary.totalPending.toLocaleString()}`, icon: Clock, color: 'text-red-400', bg: 'bg-red-500/10' },
                  { label: 'Total Records', value: summary.totalRecords, icon: Receipt, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card variant="glass" className="p-6 relative overflow-hidden group">
                      <div className={`absolute top-0 right-0 p-3 opacity-10 ${stat.color}`}>
                        <stat.icon size={60} />
                      </div>
                      <p className="text-white/50 text-xs uppercase tracking-wider mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Payment Timeline */}
              <Card variant="glass" className="overflow-hidden">
                <div className="p-5 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white">Payment History</h3>
                </div>
                {payments.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <CreditCard size={28} className="text-white/20" />
                    </div>
                    <p className="text-white/40">No payment records found.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {Object.entries(groupedByMonth).map(([month, items]) => (
                      <div key={month}>
                        <div className="px-5 py-3 bg-white/5">
                          <p className="text-white/60 text-sm font-medium">
                            {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        {items.map((p, i) => (
                          <div
                            key={p.id || i}
                            className="px-5 py-4 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors"
                            onClick={() => setSelectedPayment(p)}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-2 h-8 rounded-full ${
                                p.status === 'Completed' ? 'bg-emerald-500' : p.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'
                              }`} />
                              <div>
                                <p className="text-white font-medium">₹{(p.amount || 0).toLocaleString()}</p>
                                <p className="text-white/40 text-xs">
                                  {p.date && new Date(p.date + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  {p.method && ` • via ${p.method}`}
                                </p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              p.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                              p.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>{p.status}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPayment(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <Card variant="glass" className="p-8 border-white/20">
                <div className="text-center mb-6">
                  <Receipt size={32} className="text-cyan-400 mx-auto mb-2" />
                  <h2 className="text-xl font-bold text-white">Payment Receipt</h2>
                  <p className="text-white/40 text-sm">BrightBoard</p>
                </div>
                <div className="border-t border-dashed border-white/20 my-4" />
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Student', value: selectedPayment.studentName },
                    { label: 'Batch', value: selectedPayment.batch || '—' },
                    { label: 'Amount', value: `₹${(selectedPayment.amount || 0).toLocaleString()}` },
                    { label: 'Method', value: selectedPayment.method || '—' },
                    { label: 'Date', value: selectedPayment.date },
                    { label: 'Status', value: selectedPayment.status },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-white/50">{row.label}</span>
                      <span className="text-white font-medium">{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dashed border-white/20 my-4" />
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium"
                >
                  Close
                </button>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyPayments;
