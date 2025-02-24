import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Download, Filter, Search, Users, X, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import './AttendanceManagement.css';
import AdminSidebar from '../components/AdminSidebar';

const AttendanceManagement = () => {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const [students, setStudents] = useState([
    { id: 1, name: 'John Doe', status: 'present', attendance: 92 },
    { id: 2, name: 'Jane Smith', status: 'absent', attendance: 85 },
    { id: 3, name: 'Mike Johnson', status: 'late', attendance: 78 },
    { id: 4, name: 'Sarah Williams', status: 'excused', attendance: 95 },
  ]);

  // Mock data for charts
  const attendanceData = [
    { name: 'Mon', attendance: 95 },
    { name: 'Tue', attendance: 88 },
    { name: 'Wed', attendance: 92 },
    { name: 'Thu', attendance: 85 },
    { name: 'Fri', attendance: 90 },
  ];

  const monthlyData = [
    { month: 'Jan', present: 90, absent: 10 },
    { month: 'Feb', present: 85, absent: 15 },
    { month: 'Mar', present: 88, absent: 12 },
    { month: 'Apr', present: 92, absent: 8 },
  ];

  const handleStatusChange = (studentId, newStatus) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId ? { ...student, status: newStatus } : student
      )
    );
  };

  const handleMarkAllPresent = () => {
    setStudents(prevStudents =>
      prevStudents.map(student => ({ ...student, status: 'present' }))
    );
  };

  const handleExport = (format) => {
    const data = students.map(({ name, status, attendance }) => ({
      name,
      status,
      attendance: `${attendance}%`
    }));

    if (format === 'csv') {
      const csvContent = [
        ['Name', 'Status', 'Attendance'],
        ...data.map(Object.values)
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${selectedDate}.csv`;
      a.click();
    } else if (format === 'pdf') {
      // Implement PDF export
      console.log('PDF export - to be implemented');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setUploadedFile(file);
    // Here you would typically process the file
    // For demo purposes, we'll just show success after a delay
    setTimeout(() => {
      setUploadSuccess(true);
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadedFile(null);
        setUploadSuccess(false);
      }, 2000);
    }, 1500);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      className="attendance-container"
      
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      
    >
        
        <AdminSidebar />
        <div className="main-content">
       
      {/* Header Section */}
      <motion.div 
        className="attendance-header"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1>Attendance Management</h1>
        <div className="header-stats">
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Users size={24} />
            <div>
              <h3>Total Students</h3>
              <p>{students.length}</p>
            </div>
          </motion.div>
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Clock size={24} />
            <div>
              <h3>Present Today</h3>
              <p>{Math.round((students.filter(s => s.status === 'present').length / students.length) * 100)}%</p>
            </div>
          </motion.div>
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Calendar size={24} />
            <div>
              <h3>Monthly Avg</h3>
              <p>92%</p>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-container">
            <h3>Weekly Attendance Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="attendance" stroke="#a5b4fc" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-container">
            <h3>Monthly Overview</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="present" stackId="1" stroke="#34d399" fill="#34d399" fillOpacity={0.6} />
                <Area type="monotone" dataKey="absent" stackId="1" stroke="#f87171" fill="#f87171" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Controls Section */}
      <motion.div 
        className="attendance-controls"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="control-group">
          <select 
            value={selectedBatch} 
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="batch-select"
          >
            <option value="">Select Batch</option>
            {['Batch 2024A', 'Batch 2024B', 'Batch 2024C'].map(batch => (
              <option key={batch} value={batch}>{batch}</option>
            ))}
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-picker"
          />
        </div>
        <div className="control-group">
          <motion.div 
            className="search-box"
            whileHover={{ scale: 1.02 }}
          >
            <Search size={20} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>
          <motion.button 
            className="filter-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Filters
          </motion.button>
          <motion.button 
            className="upload-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUploadModal(true)}
          >
            <Upload size={20} />
            Bulk Upload
          </motion.button>
        </div>
        <div className="control-group">
          <motion.button 
            className="mark-all-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMarkAllPresent}
          >
            Mark All Present
          </motion.button>
          <div className="view-toggle">
            <motion.button 
              className={view === 'list' ? 'active' : ''}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView('list')}
            >
              List View
            </motion.button>
            <motion.button 
              className={view === 'grid' ? 'active' : ''}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView('grid')}
            >
              Grid View
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Attendance List */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={view}
          className={`attendance-list ${view}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'list' ? (
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Attendance %</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <motion.tr 
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td>{student.name}</td>
                    <td>
                      <select
                        value={student.status}
                        onChange={(e) => handleStatusChange(student.id, e.target.value)}
                        className={`status-select ${student.status}`}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                    </td>
                    <td>
                      <div className="attendance-progress">
                        <motion.div 
                          className="progress-bar"
                          initial={{ width: 0 }}
                          animate={{ width: `${student.attendance}%` }}
                          transition={{ duration: 0.5 }}
                        ></motion.div>
                        <span>{student.attendance}%</span>
                      </div>
                    </td>
                    <td>
                      <motion.button 
                        className="action-btn"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X size={16} />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid-view">
              {filteredStudents.map(student => (
                <motion.div 
                  key={student.id}
                  className="student-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <h3>{student.name}</h3>
                  <select
                    value={student.status}
                    onChange={(e) => handleStatusChange(student.id, e.target.value)}
                    className={`status-select ${student.status}`}
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                  <div className="attendance-progress">
                    <motion.div 
                      className="progress-bar"
                      initial={{ width: 0 }}
                      animate={{ width: `${student.attendance}%` }}
                      transition={{ duration: 0.5 }}
                    ></motion.div>
                    <span>{student.attendance}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Export Section */}
      <motion.div 
        className="export-section"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button 
          className="export-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleExport('csv')}
        >
          <Download size={20} />
          Export CSV
        </motion.button>
        <motion.button 
          className="export-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleExport('pdf')}
        >
          <Download size={20} />
          Export PDF
        </motion.button>
      </motion.div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h2>Bulk Upload Attendance</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowUploadModal(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <div 
                className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploadSuccess ? 'upload-success' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploadSuccess ? (
                  <div className="success-message">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      ✓
                    </motion.div>
                    <p>Upload Successful!</p>
                  </div>
                ) : uploadedFile ? (
                  <div className="file-info">
                    <FileSpreadsheet size={48} />
                    <p>{uploadedFile.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload size={48} />
                    <p>Drag and drop your file here or</p>
                    <button 
                      className="browse-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden-input"
                      onChange={handleFileInput}
                      accept=".csv,.xlsx,.xls"
                    />
                  </>
                )}
              </div>

              <div className="upload-info">
                <div className="info-item">
                  <AlertCircle size={20} />
                  <p>Accepted formats: .csv, .xlsx, .xls</p>
                </div>
                <div className="info-item">
                  <AlertCircle size={20} />
                  <p>Maximum file size: 5MB</p>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="upload-submit-btn"
                  disabled={!uploadedFile || uploadSuccess}
                  onClick={() => {
                    // Handle the upload submission
                    setUploadSuccess(true);
                    setTimeout(() => {
                      setShowUploadModal(false);
                      setUploadedFile(null);
                      setUploadSuccess(false);
                    }, 2000);
                  }}
                >
                  Upload
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AttendanceManagement;