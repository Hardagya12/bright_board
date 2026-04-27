import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Video, Image, Link2, Download, Eye, Search, Sparkles } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../utils/api';

const typeConfig = {
  pdf: { icon: FileText, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30 shadow-[inset_0_0_15px_rgba(248,113,113,0.1)]' },
  doc: { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30 shadow-[inset_0_0_15px_rgba(59,130,246,0.1)]' },
  video: { icon: Video, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30 shadow-[inset_0_0_15px_rgba(168,85,247,0.1)]' },
  image: { icon: Image, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30 shadow-[inset_0_0_15px_rgba(52,211,153,0.1)]' },
  file: { icon: FileText, color: 'text-[#868685]', bg: 'bg-white border-[#e8ebe6] shadow-inner' },
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
    <div className="flex h-screen overflow-hidden bg-[#f9faf6] font-body relative">
      <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
                  
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-[#e8ebe6] scrollbar-track-transparent relative z-10">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0e0f0c] font-display tracking-tight mb-2">Study Materials</h1>
              <p className="text-[#868685] tracking-wide mt-2">Access notes, videos, and resources shared by your tutor.</p>
            </div>
            {newCount > 0 && (
              <div className="flex items-center gap-3 px-5 py-2.5 bg-cyan-500/10 border border-cyan-400/30 rounded-full shadow-[0_0_15px_rgba(0,245,255,0.15)]">
                <Sparkles size={18} className="text-cyan-400 animate-pulse" />
                <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">{newCount} new this week</span>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-4 rounded-full border border-[#e8ebe6] shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#868685]" size={18} />
              <input
                type="text"
                placeholder="Search materials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-[#e8ebe6] rounded-full pl-12 pr-6 py-3 text-sm font-medium tracking-wide text-[#0e0f0c] placeholder:text-[#868685] focus:border-cyan-400 focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] outline-none transition-all shadow-inner"
              />
            </div>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="bg-white border border-[#e8ebe6] rounded-full px-6 py-3 text-sm font-medium tracking-wide text-[#0e0f0c]/80 outline-none hover:border-[#e8ebe6] transition-all shadow-inner custom-select appearance-none cursor-pointer pr-10"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border border-[#e8ebe6] rounded-full px-6 py-3 text-sm font-medium tracking-wide text-[#0e0f0c]/80 outline-none hover:border-[#e8ebe6] transition-all shadow-inner custom-select appearance-none cursor-pointer pr-10"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              <option value="">All Types</option>
              {types.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
          </div>

          {/* Materials Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-56 rounded-[24px] bg-white" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-12 md:p-16 text-center border-dashed border-[#e8ebe6]">
              <div className="w-24 h-24 rounded-[24px] bg-white flex items-center justify-center mx-auto mb-6 border border-[#e8ebe6] shadow-inner">
                <FileText size={40} className="text-[#e8ebe6]" />
              </div>
              <h3 className="text-2xl font-bold text-[#0e0f0c] font-display mb-2">No Materials Found</h3>
              <p className="text-[#868685] tracking-wide">No study materials match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-6 h-full flex flex-col group hover:-translate-y-2 transition-all duration-300 relative shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                      {mat.isNew && (
                        <span className="absolute top-4 right-4 px-3 py-1 bg-cyan-400 text-[#0f0f1a] text-[10px] font-bold uppercase tracking-widest rounded-full shadow-glow-cyan">NEW</span>
                      )}
                      <div className="flex items-start gap-5 mb-5">
                        <div className={`w-14 h-14 rounded-[16px] border ${cfg.bg} flex items-center justify-center ${cfg.color} shrink-0 group-hover:scale-105 transition-transform`}>
                          <IconComponent size={24} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-[#0e0f0c] font-bold font-display tracking-wide truncate text-lg group-hover:text-cyan-400 transition-colors mt-0.5">{mat.name}</h3>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="px-3 py-1 bg-white border border-[#e8ebe6] rounded-full text-[10px] font-bold uppercase tracking-widest text-[#868685] shadow-inner">{mat.subject || 'General'}</span>
                            <span className="text-[#868685] text-[10px] font-bold uppercase tracking-widest">{mat.type?.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-bold tracking-wide text-[#868685] mb-6 bg-white/[0.02] p-3 rounded-[12px] border border-[#e8ebe6]">
                        <span className="flex items-center gap-1.5">📅 {timeSince(mat.createdAt || mat.uploadDate)}</span>
                        {mat.views > 0 && <span className="flex items-center gap-1.5">👁 {mat.views} views</span>}
                      </div>

                      <div className="mt-auto flex gap-3 pt-2">
                        {mat.url && (
                          <>
                            <a
                              href={mat.url.startsWith('/') ? `${api.defaults.baseURL}${mat.url}` : mat.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white hover:bg-[#e2f6d5] border border-[#e8ebe6] text-[#0e0f0c] font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-inner"
                            >
                              <Eye size={16} /> View
                            </a>
                            <a
                              href={mat.url.startsWith('/') ? `${api.defaults.baseURL}${mat.url}` : mat.url}
                              download
                              className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-400 font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-[inset_0_0_15px_rgba(0,245,255,0.1)]"
                            >
                              <Download size={16} /> Download
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-[#f9faf6]/80 backdrop-blur-xl z-50 flex items-center justify-center p-6 font-body" onClick={() => setPreviewUrl(null)}>
          <div className="w-full max-w-5xl bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm border border-cyan-400/30 rounded-[32px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)]" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-[#e8ebe6] flex items-center justify-between bg-white/[0.02]">
              <h3 className="text-[#0e0f0c] font-bold font-display tracking-wide flex items-center gap-3"><Eye className="text-cyan-400"/> Document Preview</h3>
              <button onClick={() => setPreviewUrl(null)} className="w-8 h-8 rounded-full bg-white border border-[#e8ebe6] flex items-center justify-center text-[#868685] hover:text-[#0e0f0c] hover:bg-[#e2f6d5] transition-colors">✕</button>
            </div>
            <iframe src={previewUrl} className="w-full h-[75vh]" title="Preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMaterials;
