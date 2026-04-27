import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, AlertTriangle, CheckCircle, Clock, DollarSign, Receipt, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
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
    <div className="flex h-screen overflow-hidden bg-[#f9faf6] font-body relative">
      <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
            
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-[#e8ebe6] scrollbar-track-transparent relative z-10">
        <div className="max-w-7xl mx-auto space-y-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#0e0f0c] font-display tracking-tight mb-2">My Payments</h1>
            <p className="text-[#868685] tracking-wide mt-2">View your fee records and pending dues.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-[24px] bg-white" />)}
            </div>
          ) : (
            <>
              {/* Pending Dues Alert */}
              {summary.totalPending > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-[20px] bg-red-500/10 border border-red-500/30 flex items-center gap-4 shadow-[0_0_15px_rgba(248,113,113,0.15)]"
                >
                  <AlertTriangle className="text-red-400 shrink-0" size={24} />
                  <p className="text-red-400 text-sm font-bold tracking-wide">
                    You have ₹{summary.totalPending.toLocaleString()} pending fees. Please contact your tutor.
                  </p>
                </motion.div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: 'Amount Paid', value: `₹${summary.totalPaid.toLocaleString()}`, icon: CheckCircle, color: 'text-emerald-400', accent: 'green' },
                  { label: 'Pending Dues', value: `₹${summary.totalPending.toLocaleString()}`, icon: Clock, color: 'text-amber-400', accent: 'amber' },
                  { label: 'Total Records', value: summary.totalRecords, icon: Receipt, color: 'text-cyan-400', accent: 'cyan' },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className={`bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-8 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 accent-top-${stat.accent} shadow-[0_8px_32px_rgba(0,0,0,0.2)]`}>
                      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity ${stat.color}`}>
                        <stat.icon size={80} className="transform rotate-12" />
                      </div>
                      <p className="text-[#868685] text-[10px] font-bold uppercase tracking-widest mb-3 relative z-10">{stat.label}</p>
                      <p className={`text-4xl font-bold font-display tracking-tight drop-shadow-md relative z-10 ${stat.color}`}>{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Payment Timeline */}
              <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm overflow-hidden accent-top-purple">
                <div className="p-8 border-b border-[#e8ebe6]">
                  <h3 className="text-2xl font-bold text-[#0e0f0c] font-display tracking-tight">Payment History</h3>
                </div>
                {payments.length === 0 ? (
                  <div className="p-16 text-center border-dashed border-[#e8ebe6] m-8 rounded-[24px]">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-6 border border-[#e8ebe6] shadow-inner">
                      <CreditCard size={32} className="text-[#e8ebe6]" />
                    </div>
                    <p className="text-[#868685] tracking-wide font-medium">No payment records found.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {Object.entries(groupedByMonth).map(([month, items]) => (
                      <div key={month}>
                        <div className="px-8 py-4 bg-white/[0.02]">
                          <p className="text-[#868685] text-[10px] font-bold uppercase tracking-widest">
                            {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        {items.map((p, i) => (
                          <div
                            key={p.id || i}
                            className="px-8 py-6 flex items-center justify-between hover:bg-white/[0.04] cursor-pointer transition-colors group"
                            onClick={() => setSelectedPayment(p)}
                          >
                            <div className="flex items-center gap-6">
                              <div className={`w-14 h-14 rounded-[16px] shadow-inner flex items-center justify-center group-hover:scale-105 transition-transform ${
                                p.status === 'Completed' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : p.status === 'Pending' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
                              }`}>
                                <DollarSign size={24} />
                              </div>
                              <div>
                                <p className="text-[#0e0f0c] font-bold text-xl tracking-wide font-display group-hover:text-cyan-400 transition-colors">₹{(p.amount || 0).toLocaleString()}</p>
                                <p className="text-[#868685] text-xs font-medium tracking-wide mt-1">
                                  {p.date && new Date(p.date + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  {p.method && ` • via ${p.method}`}
                                </p>
                              </div>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-inner ${
                              p.status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                              p.status === 'Pending' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                              'bg-red-500/10 border-red-500/30 text-red-400'
                            }`}>{p.status}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
            className="fixed inset-0 bg-[#f9faf6]/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 font-body"
            onClick={() => setSelectedPayment(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-10 border-cyan-400/30 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden accent-top-cyan">
                <div className="absolute top-0 left-10 right-10 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 blur-sm rounded-full"></div>
                
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-[24px] bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6 text-cyan-400 shadow-inner">
                    <Receipt size={36} className="drop-shadow-[0_0_10px_rgba(0,245,255,0.5)]" />
                  </div>
                  <h2 className="text-3xl font-bold text-[#0e0f0c] font-display tracking-tight mb-1">Payment Receipt</h2>
                  <p className="text-[#868685] text-[10px] font-bold uppercase tracking-widest">BrightBoard System</p>
                </div>
                
                <div className="border-t border-dashed border-[#e8ebe6] my-6" />
                
                <div className="space-y-4 text-sm font-medium tracking-wide">
                  {[
                    { label: 'Student', value: selectedPayment.studentName },
                    { label: 'Batch', value: selectedPayment.batch || '—' },
                    { label: 'Amount', value: `₹${(selectedPayment.amount || 0).toLocaleString()}`, isHighlight: true },
                    { label: 'Method', value: selectedPayment.method || '—' },
                    { label: 'Date', value: selectedPayment.date },
                    { label: 'Status', value: selectedPayment.status, isStatus: true },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center bg-white/[0.02] p-4 rounded-[16px] border border-[#e8ebe6]">
                      <span className="text-[#868685]">{row.label}</span>
                      {row.isStatus ? (
                         <span className={`font-bold ${row.value === 'Completed' ? 'text-emerald-400' : row.value === 'Pending' ? 'text-amber-400' : 'text-red-400'}`}>{row.value}</span>
                      ) : row.isHighlight ? (
                         <span className="text-cyan-400 font-bold text-lg">{row.value}</span>
                      ) : (
                         <span className="text-[#0e0f0c] font-bold">{row.value}</span>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-dashed border-[#e8ebe6] my-6" />
                
                <Button
                  onClick={() => setSelectedPayment(null)}
                  className="w-full py-4 rounded-full bg-white border border-[#e8ebe6] hover:bg-[#e2f6d5] text-[#0e0f0c] font-bold tracking-wide transition-all shadow-inner"
                >
                  Close Receipt
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyPayments;
