import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Video, Image, Link2, Download, Eye, Search, Filter, ExternalLink, Sparkles } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../utils/api';

const typeConfig = {
  pdf: { icon: FileText, color: 'text-red-400', bg: 'bg-red-500/10' },
  doc: { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  video: { icon: Video, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  image: { icon: Image, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  file: { icon: FileText, color: 'text-white/60', bg: 'bg-white/10' },
};

const MyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterType, setFilterType] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/student/materials');
        setMaterials(data.materials || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const subjects = [...new Set(materials.map(m => m.subject).filter(Boolean))];
  const types = [...new Set(materials.map(m => m.type).filter(Boolean))];
  const newCount = materials.filter(m => m.isNew).length;

  const filtered = materials.filter(m => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterSubject && m.subject !== filterSubject) return false;
    if (filterType && m.type !== filterType) return false;
    return true;
  });

  const timeSince = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Study Materials</h1>
              <p className="text-white/50">Access notes, videos, and resources shared by your tutor.</p>
            </div>
            {newCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                <Sparkles size={16} className="text-cyan-400" />
                <span className="text-cyan-400 text-sm font-medium">{newCount} new this week</span>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="text"
                placeholder="Search materials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-cyan-500/50 outline-none"
              />
            </div>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 outline-none"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 outline-none"
            >
              <option value="">All Types</option>
              {types.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
          </div>

          {/* Materials Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 rounded-2xl bg-white/5" />)}
            </div>
          ) : filtered.length === 0 ? (
            <Card variant="glass" className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-white/20" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Materials Found</h3>
              <p className="text-white/40">No study materials match your filters.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((mat, idx) => {
                const cfg = typeConfig[mat.type] || typeConfig.file;
                const IconComponent = cfg.icon;
                return (
                  <motion.div
                    key={mat.id || mat._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card variant="glass" className="p-5 h-full flex flex-col group hover:bg-white/5 transition-colors relative">
                      {mat.isNew && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 bg-cyan-500 text-[10px] font-bold uppercase text-white rounded-full">NEW</span>
                      )}
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl ${cfg.bg} flex items-center justify-center ${cfg.color} shrink-0`}>
                          <IconComponent size={24} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-white font-bold truncate">{mat.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-white/50 font-medium">{mat.subject || 'General'}</span>
                            <span className="text-white/30 text-xs">{mat.type?.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
                        <span>📅 {timeSince(mat.createdAt || mat.uploadDate)}</span>
                        {mat.views > 0 && <span>👁 {mat.views} views</span>}
                      </div>

                      <div className="mt-auto flex gap-2">
                        {mat.url && (
                          <>
                            <a
                              href={mat.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm rounded-lg transition-colors"
                            >
                              <Eye size={14} /> View
                            </a>
                            <a
                              href={mat.url}
                              download
                              className="flex-1 flex items-center justify-center gap-2 py-2 bg-cyan-600/80 hover:bg-cyan-600 text-white text-sm rounded-lg transition-colors"
                            >
                              <Download size={14} /> Download
                            </a>
                          </>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setPreviewUrl(null)}>
          <div className="w-full max-w-4xl max-h-[80vh] bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-bold">Preview</h3>
              <button onClick={() => setPreviewUrl(null)} className="text-white/60 hover:text-white">✕</button>
            </div>
            <iframe src={previewUrl} className="w-full h-[70vh]" title="Preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMaterials;
