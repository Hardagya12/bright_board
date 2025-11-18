import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Download, Filter, Search, Users, X, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import AdminSidebar from '../components/AdminSidebar';
import { listStudents } from '../../utils/services/students';

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

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await listStudents({ limit: 100 });
        const mapped = (data.students || []).map(s => ({ id: s._id || s.id, name: s.name, status: 'present', attendance: 90 }));
        setStudents(mapped);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
    <div className="min-h-screen bg-black text-white flex">
      <AdminSidebar />
      <motion.div 
        className="flex-1 p-6 space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
       
      {/* Header Section */}
      <motion.div 
        className="border border-bw-37 rounded-lg bg-black p-4"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="font-comic text-2xl mb-4">Attendance Management</h1>
        {loading && <div className="text-bw-62">Loading...</div>}
        {error && <div className="text-bw-62">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            className="border border-bw-37 rounded-lg bg-black p-4 flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Users size={24} />
            <div>
              <h3 className="text-sm text-bw-75">Total Students</h3>
              <p>{students.length}</p>
            </div>
          </motion.div>
          <motion.div 
            className="border border-bw-37 rounded-lg bg-black p-4 flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Clock size={24} />
            <div>
              <h3 className="text-sm text-bw-75">Present Today</h3>
              <p>{Math.round((students.filter(s => s.status === 'present').length / students.length) * 100)}%</p>
            </div>
          </motion.div>
          <motion.div 
            className="border border-bw-37 rounded-lg bg-black p-4 flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Calendar size={24} />
            <div>
              <h3 className="text-sm text-bw-75">Monthly Avg</h3>
              <p>92%</p>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="border border-bw-37 rounded-lg bg-black p-4">
            <h3 className="font-comic mb-2">Weekly Attendance Trend</h3>
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
          <div className="border border-bw-37 rounded-lg bg-black p-4">
            <h3 className="font-comic mb-2">Monthly Overview</h3>
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
        className="border border-bw-37 rounded-lg bg-black p-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <select 
            value={selectedBatch} 
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="bg-black border border-bw-37 rounded px-3 py-2"
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
            className="bg-black border border-bw-37 rounded px-3 py-2"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <motion.div 
            className="flex items-center gap-2 border border-bw-37 rounded px-3 py-2"
            whileHover={{ scale: 1.02 }}
          >
            <Search size={20} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black focus:outline-none"
            />
          </motion.div>
          <motion.button 
            className="border border-bw-37 rounded px-3 py-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Filters
          </motion.button>
          <motion.button 
            className="border border-bw-37 rounded px-3 py-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUploadModal(true)}
          >
            <Upload size={20} />
            Bulk Upload
          </motion.button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <motion.button 
            className="border border-bw-37 rounded px-3 py-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMarkAllPresent}
          >
            Mark All Present
          </motion.button>
          <div className="flex items-center gap-2">
            <motion.button 
              className={`border border-bw-37 rounded px-3 py-2 ${view === 'list' ? 'bg-bw-12' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView('list')}
            >
              List View
            </motion.button>
            <motion.button 
              className={`border border-bw-37 rounded px-3 py-2 ${view === 'grid' ? 'bg-bw-12' : ''}`}
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
          className={`border border-bw-37 rounded-lg bg-black p-4 ${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 gap-4' : ''}`}
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
                    <td className="px-3 py-2">{student.name}</td>
                    <td>
                      <select
                        value={student.status}
                        onChange={(e) => handleStatusChange(student.id, e.target.value)}
                        className={`bg-black border border-bw-37 rounded px-2 py-1 ${student.status}`}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <motion.div 
                          className="h-2 bg-bw-12 rounded"
                          initial={{ width: 0 }}
                          animate={{ width: `${student.attendance}%` }}
                          transition={{ duration: 0.5 }}
                        ></motion.div>
                        <span>{student.attendance}%</span>
                      </div>
                    </td>
                    <td>
                      <motion.button 
                        className="border border-bw-37 rounded p-2"
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
            <div>
              {filteredStudents.map(student => (
                <motion.div 
                  key={student.id}
                  className="border border-bw-37 rounded-lg bg-black p-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <h3>{student.name}</h3>
                  <select
                    value={student.status}
                    onChange={(e) => handleStatusChange(student.id, e.target.value)}
                    className={`bg-black border border-bw-37 rounded px-2 py-1 ${student.status}`}
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                  <div className="flex items-center gap-2 mt-2">
                    <motion.div 
                      className="h-2 bg-bw-12 rounded"
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
        className="border border-bw-37 rounded-lg bg-black p-4 flex items-center gap-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button 
          className="border border-bw-37 rounded px-3 py-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleExport('csv')}
        >
          <Download size={20} />
          Export CSV
        </motion.button>
        <motion.button 
          className="border border-bw-37 rounded px-3 py-2"
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
            className="fixed inset-0 bg-black/60 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="border border-bw-37 bg-black text-white rounded-lg p-6 w-full max-w-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h2>Bulk Upload Attendance</h2>
                <button 
                  className="border border-bw-37 rounded p-2"
                  onClick={() => setShowUploadModal(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <div 
                className={`border border-bw-37 rounded p-6 text-center ${dragActive ? 'bg-bw-12' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploadSuccess ? (
                  <div>
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
                  <div className="flex items-center gap-2 justify-center">
                    <FileSpreadsheet size={48} />
                    <p>{uploadedFile.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload size={48} />
                    <p>Drag and drop your file here or</p>
                    <button 
                      className="border border-bw-37 rounded px-3 py-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileInput}
                      accept=".csv,.xlsx,.xls"
                    />
                  </>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-bw-75">
                  <AlertCircle size={20} />
                  <p>Accepted formats: .csv, .xlsx, .xls</p>
                </div>
                <div className="flex items-center gap-2 text-bw-75">
                  <AlertCircle size={20} />
                  <p>Maximum file size: 5MB</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button 
                  className="border border-bw-37 rounded px-3 py-2"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="border border-bw-37 rounded px-3 py-2"
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
      </motion.div>
    </div>
  );
};

export default AttendanceManagement;