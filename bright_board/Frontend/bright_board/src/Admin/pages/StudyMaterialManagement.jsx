import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  File, 
  BarChart3,
  FolderOpen,
  Lock,
  Eye
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { listMaterials, createMaterial, updateMaterialMetrics } from '../../utils/services/materials';
import { listBatches } from '../../utils/services/batches';

const StudyMaterialManagement = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [isDragging, setIsDragging] = useState(false);

  const [batches, setBatches] = useState(['all']);
  const [subjects, setSubjects] = useState(['all']);

  useEffect(() => {
    const loadMaterials = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await listMaterials();
        const ms = data.materials || [];
        setMaterials(ms);
        const subj = ['all', ...Array.from(new Set(ms.map(m => (m.subject || '').toLowerCase()).filter(Boolean)))];
        setSubjects(subj);
        try {
          const { data: b } = await listBatches({ limit: 100 });
          const bb = (b.batches || []).map(x => x.batchId);
          setBatches(['all', ...bb]);
        } catch {}
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    loadMaterials();
  }, []);

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="icon-red" />;
      case 'image':
        return <ImageIcon className="icon-blue" />;
      case 'video':
        return <Video className="icon-purple" />;
      default:
        return <File className="icon-gray" />;
    }
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleSubjectChange = (e) => setSelectedSubject(e.target.value);
  const handleBatchChange = (e) => setSelectedBatch(e.target.value);
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileUpload = async (files) => {
    const payloads = files.map((file) => ({
      name: file.name,
      type: (file.name.split('.').pop() || 'file').toLowerCase(),
      subject: selectedSubject !== 'all' ? selectedSubject : 'Uncategorized',
      batch: selectedBatch !== 'all' ? selectedBatch : 'General',
      url: '',
      restricted: false,
    }));
    for (const p of payloads) {
      try {
        const { data } = await createMaterial(p);
        setMaterials((prev) => [...prev, data.material]);
      } catch (err) {
        console.error('Create material failed', err);
      }
    }
  };

  const handleDownload = async (material) => {
    if (material.restricted) return;
    const nextDownloads = (material.downloads || 0) + 1;
    setMaterials(materials.map(m => m.id === material.id ? { ...m, downloads: nextDownloads } : m));
    try { await updateMaterialMetrics(material.id, { downloads: nextDownloads }); } catch {}
    const dummyContent = `This is a sample ${material.type} file: ${material.name}`;
    const blob = new Blob([dummyContent], { type: `application/${material.type}` });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = material.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleView = async (material) => {
    const nextViews = (material.views || 0) + 1;
    setMaterials(materials.map(m => m.id === material.id ? { ...m, views: nextViews } : m));
    try { await updateMaterialMetrics(material.id, { views: nextViews }); } catch {}
  };

  const handleToggleRestriction = (materialId) => {
    setMaterials(materials.map(material => 
      material.id === materialId ? { ...material, restricted: !material.restricted } : material
    ));
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || material.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchesBatch = selectedBatch === 'all' || material.batch === selectedBatch;
    return matchesSearch && matchesSubject && matchesBatch;
  });

  const totalViews = filteredMaterials.reduce((sum, material) => sum + material.views, 0);
  const totalDownloads = filteredMaterials.reduce((sum, material) => sum + material.downloads, 0);

  return (
    <div className="min-h-screen bg-black text-white flex">
      <AdminSidebar />
      <div className="flex-1 p-6 space-y-6">
        <h1 className="font-comic text-2xl">Study Material Management</h1>
        {loading && <div className="text-bw-62">Loading...</div>}
        {error && <div className="text-bw-62">{error}</div>}
        <motion.div 
          className="border border-bw-37 rounded-lg bg-black p-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div className="stat-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="border border-bw-37 rounded-lg bg-black p-4 flex items-center gap-3">
              <BarChart3 className="stat-icon blue" />
              <div className="stat-info">
                <p className="text-sm text-bw-75">Total Materials</p>
                <p>{filteredMaterials.length}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div className="stat-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <div className="border border-bw-37 rounded-lg bg-black p-4 flex items-center gap-3">
              <Download className="stat-icon green" />
              <div className="stat-info">
                <p className="text-sm text-bw-75">Total Downloads</p>
                <p>{totalDownloads}</p>
              </div>
            </div>
          </motion.div>

          <motion.div className="stat-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }}>
            <div className="border border-bw-37 rounded-lg bg-black p-4 flex items-center gap-3">
              <Eye className="stat-icon purple" />
              <div className="stat-info">
                <p className="text-sm text-bw-75">Total Views</p>
                <p>{totalViews}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div className="border border-bw-37 rounded-lg bg-black p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 border border-bw-37 rounded px-3 py-2 w-full md:w-auto">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={handleSearch}
                className="bg-black focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <select value={selectedSubject} onChange={handleSubjectChange} className="bg-black border border-bw-37 rounded px-3 py-2">
                {subjects.map(s => (
                  <option key={s} value={s}>{s === 'all' ? 'All Subjects' : s}</option>
                ))}
              </select>
              <select value={selectedBatch} onChange={handleBatchChange} className="bg-black border border-bw-37 rounded px-3 py-2">
                {batches.map(batch => (
                  <option key={batch} value={batch}>
                    {batch === 'all' ? 'All Batches' : `Batch ${batch}`}
                  </option>
                ))}
              </select>
              <button className="border border-bw-37 rounded px-3 py-2">
                <Filter />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className={`border border-bw-37 rounded p-6 text-center ${isDragging ? 'bg-bw-12' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="upload-icon" />
          <h3>Drag and drop files here</h3>
          <p>or click to browse from your computer</p>
          <input
            type="file"
            id="file-upload"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(Array.from(e.target.files))}
          />
          <label htmlFor="file-upload" className="border border-bw-37 rounded px-3 py-2 inline-block cursor-pointer">
            Upload Files
          </label>
        </motion.div>

        <motion.div className="border border-bw-37 rounded-lg bg-black p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Batch</th>
                  <th>Upload Date</th>
                  <th>Downloads</th>
                  <th>Views</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((material) => (
                  <motion.tr 
                    key={material.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        {getFileIcon(material.type)}
                        <span>{material.name}</span>
                      </div>
                    </td>
                    <td>{material.subject}</td>
                    <td>{material.batch}</td>
                    <td>{material.uploadDate}</td>
                    <td>{material.downloads}</td>
                    <td>{material.views}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button 
                          className="border border-bw-37 rounded p-2"
                          onClick={() => handleDownload(material)}
                          title="Download"
                          disabled={material.restricted}
                        >
                          <Download />
                        </button>
                        <button 
                          className="border border-bw-37 rounded p-2"
                          onClick={() => handleView(material)}
                          title="Show Views"
                        >
                          <Eye />
                        </button>
                        <button 
                          className={`border border-bw-37 rounded p-2 ${material.restricted ? 'bg-bw-12' : ''}`}
                          onClick={() => handleToggleRestriction(material.id)}
                          title={material.restricted ? "Grant Access" : "Restrict Access"}
                        >
                          <Lock />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudyMaterialManagement;