import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Calendar, Clock, CheckCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Card from '../../components/ui/Card';
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
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">My Batches</h1>
            <p className="text-white/50">View the batches you are enrolled in.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => <Skeleton key={i} className="h-48 rounded-2xl bg-white/5" />)}
            </div>
          ) : batches.length === 0 ? (
            <Card variant="glass" className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} className="text-white/20" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Batches Found</h3>
              <p className="text-white/40">You haven't been enrolled in any batches yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {batches.map((batch, idx) => (
                <motion.div
                  key={batch.id || batch._id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card variant="glass" className="p-6 group hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <BookOpen size={24} className="text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{batch.name}</h3>
                          <span className="px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium rounded-full">
                            {batch.course || 'General'}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        batch.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/50'
                      }`}>
                        {batch.status || 'Active'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="flex items-center gap-2 text-sm text-white/50">
                        <Calendar size={14} className="text-white/30" />
                        <span>{formatDate(batch.startDate)} – {formatDate(batch.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/50">
                        <Users size={14} className="text-white/30" />
                        <span>Capacity: {batch.capacity || '—'}</span>
                      </div>
                    </div>

                    {batch.batchId && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <span className="text-white/30 text-xs">Batch ID: {batch.batchId}</span>
                      </div>
                    )}
                  </Card>
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
