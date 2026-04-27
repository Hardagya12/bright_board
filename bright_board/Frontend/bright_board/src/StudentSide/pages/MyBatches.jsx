import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Calendar, Clock, CheckCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../utils/api';

const MyBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/student/batches');
        setBatches(data.batches || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="flex h-screen overflow-hidden bg-[#f9faf6] font-body relative">
      <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
            
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-[#e8ebe6] scrollbar-track-transparent relative z-10">
        <div className="max-w-7xl mx-auto space-y-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#0e0f0c] font-display tracking-tight mb-2">My Batches</h1>
            <p className="text-[#868685] tracking-wide mt-2">View the batches you are enrolled in.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map(i => <Skeleton key={i} className="h-48 rounded-[24px] bg-white" />)}
            </div>
          ) : batches.length === 0 ? (
            <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-12 md:p-16 text-center border-dashed border-[#e8ebe6]">
              <div className="w-24 h-24 rounded-[24px] bg-white flex items-center justify-center mx-auto mb-6 border border-[#e8ebe6] shadow-inner">
                <BookOpen size={40} className="text-[#e8ebe6]" />
              </div>
              <h3 className="text-2xl font-bold text-[#0e0f0c] font-display mb-2">No Batches Found</h3>
              <p className="text-[#868685] tracking-wide">You haven't been enrolled in any batches yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {batches.map((batch, idx) => (
                <motion.div
                  key={batch.id || batch._id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-8 group hover:-translate-y-2 transition-all duration-300 accent-top-purple shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[16px] bg-purple-500/10 border border-purple-500/30 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner text-purple-400">
                          <BookOpen size={32} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-[#0e0f0c] font-display tracking-wide group-hover:text-cyan-400 transition-colors">{batch.name}</h3>
                          <span className="px-3 py-1 bg-white border border-[#e8ebe6] text-[#868685] text-[10px] font-bold uppercase tracking-widest rounded-full mt-2 inline-block shadow-inner">
                            {batch.course || 'General'}
                          </span>
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border shadow-inner ${
                        batch.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.15)]' : 'bg-white border-[#e8ebe6] text-[#868685]'
                      }`}>
                        {batch.status || 'Active'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6 bg-white/[0.02] border border-[#e8ebe6] p-4 rounded-[16px] shadow-inner">
                      <div className="flex items-center gap-3 text-sm text-[#868685] font-medium tracking-wide">
                        <Calendar size={16} className="text-[#868685]" />
                        <span>{formatDate(batch.startDate)} <span className="text-[#e8ebe6] mx-1">–</span> {formatDate(batch.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#868685] font-medium tracking-wide">
                        <Users size={16} className="text-[#868685]" />
                        <span>Capacity: <span className="text-[#0e0f0c]">{batch.capacity || '—'}</span></span>
                      </div>
                    </div>

                    {batch.batchId && (
                      <div className="mt-6 pt-4 border-t border-[#e8ebe6]">
                        <span className="text-[#868685] text-[10px] font-bold uppercase tracking-widest">System ID: {batch.batchId}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBatches;
