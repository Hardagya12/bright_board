import React, { useState } from 'react';
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
import './StudyMaterialManagement.css';
import AdminSidebar from '../components/AdminSidebar';

const StudyMaterialManagement = () => {
  const [materials, setMaterials] = useState([
    {
      id: '1',
      name: 'Physics Notes Chapter 1',
      type: 'pdf',
      subject: 'Physics',
      batch: '2024',
      uploadDate: '2024-03-10',
      downloads: 156,
      views: 342,
      restricted: false
    },
    {
      id: '2',
      name: 'Chemistry Lab Manual',
      type: 'doc',
      subject: 'Chemistry',
      batch: '2024',
      uploadDate: '2024-03-09',
      downloads: 89,
      views: 245,
      restricted: false
    },
    {
      id: '3',
      name: 'Maths Formula Sheet',
      type: 'pdf',
      subject: 'Mathematics',
      batch: '2023',
      uploadDate: '2023-03-15',
      downloads: 120,
      views: 280,
      restricted: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [isDragging, setIsDragging] = useState(false);

  const batches = ['all', '2024', '2023', '2022'];

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

  const handleFileUpload = (files) => {
    const newMaterials = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      type: file.name.split('.').pop().toLowerCase(),
      subject: selectedSubject !== 'all' ? selectedSubject : 'Uncategorized',
      batch: selectedBatch !== 'all' ? selectedBatch : '2024',
      uploadDate: new Date().toISOString().split('T')[0],
      downloads: 0,
      views: 0,
      restricted: false
    }));
    setMaterials([...materials, ...newMaterials]);
  };

  const handleDownload = (material) => {
    if (material.restricted) return;
    setMaterials(materials.map(m => 
      m.id === material.id ? { ...m, downloads: m.downloads + 1 } : m
    ));
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

  const handleView = (material) => {
    alert(`Total views for ${material.name}: ${material.views}`);
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
    <div className="study-material-container">
      <AdminSidebar />
      <div className="main-content">
      <h1>Study Material Management</h1>
        <motion.div 
          className="header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          
        </motion.div>

        <div className="stats-grid">
          <motion.div className="stat-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="stat-content">
              <BarChart3 className="stat-icon blue" />
              <div className="stat-info">
                <p className="stat-label">Total Materials</p>
                <p className="stat-value">{filteredMaterials.length}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div className="stat-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <div className="stat-content">
              <Download className="stat-icon green" />
              <div className="stat-info">
                <p className="stat-label">Total Downloads</p>
                <p className="stat-value">{totalDownloads}</p>
              </div>
            </div>
          </motion.div>

          <motion.div className="stat-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }}>
            <div className="stat-content">
              <Eye className="stat-icon purple" />
              <div className="stat-info">
                <p className="stat-label">Total Views</p>
                <p className="stat-value">{totalViews}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div className="search-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <div className="search-container">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </div>
            <div className="filter-controls">
              <select value={selectedSubject} onChange={handleSubjectChange} className="subject-select">
                <option value="all">All Subjects</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="mathematics">Mathematics</option>
              </select>
              <select value={selectedBatch} onChange={handleBatchChange} className="batch-select">
                {batches.map(batch => (
                  <option key={batch} value={batch}>
                    {batch === 'all' ? 'All Batches' : `Batch ${batch}`}
                  </option>
                ))}
              </select>
              <button className="filter-button">
                <Filter />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className={`upload-section ${isDragging ? 'dragging' : ''}`}
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
            className="hidden-input"
            onChange={(e) => handleFileUpload(Array.from(e.target.files))}
          />
          <label htmlFor="file-upload" className="upload-button">
            Upload Files
          </label>
        </motion.div>

        <motion.div className="materials-table-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <div className="table-wrapper">
            <table className="materials-table">
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
                      <div className="file-name">
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
                      <div className="action-buttons">
                        <button 
                          className="action-button"
                          onClick={() => handleDownload(material)}
                          title="Download"
                          disabled={material.restricted}
                        >
                          <Download />
                        </button>
                        <button 
                          className="action-button"
                          onClick={() => handleView(material)}
                          title="Show Views"
                        >
                          <Eye />
                        </button>
                        <button 
                          className={`action-button ${material.restricted ? 'restricted' : ''}`}
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