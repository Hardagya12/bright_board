import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Download, Filter, Search, Users, X, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import AdminSidebar from '../components/AdminSidebar';
import { listStudents } from '../../utils/services/students';
import { getAttendanceStats, listAttendance, uploadAttendanceBulk } from '../../utils/services/attendance';
import { listBatches } from '../../utils/services/batches';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [saveMessage, setSaveMessage] = useState('');
  const [managerOpen, setManagerOpen] = useState(false);
  const [managerLoading, setManagerLoading] = useState(false);
  const [managerError, setManagerError] = useState('');
  const [managerSuccess, setManagerSuccess] = useState('');
  const [managerStudents, setManagerStudents] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const batchSelectRef = useRef(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [dateError, setDateError] = useState('');
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState('');
  const [overviewRows, setOverviewRows] = useState([]);
  const [studentNameMap, setStudentNameMap] = useState(new Map());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await listStudents({ limit: 100 });
        const mapped = (data.students || []).map(s => ({ id: s.studentId || s.id || s._id, name: s.name, status: 'present', attendance: 90 }));
        setStudents(mapped);
        try {
          const { data: b } = await listBatches({ limit: 100 });
          setBatches((b.batches || []).map(x => ({ id: x.batchId || x._id, name: x.name })));
        } catch {}
        const statsRes = await getAttendanceStats({ range: 'week' });
        setWeeklyData(statsRes.data.weekly || []);
        setMonthlyData(statsRes.data.monthly || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const attendanceData = weeklyData;

  useEffect(() => {
    if (!managerOpen) return;
    setTimeout(() => {
      batchSelectRef.current?.focus();
    }, 0);
  }, [managerOpen]);

  const todayStr = new Date().toISOString().split('T')[0];
  const handleDateChange = (val) => {
    setSelectedDate(val);
    if (val > todayStr) {
      setDateError('Future dates are not allowed');
    } else {
      setDateError('');
    }
    loadDraftIfAvailable(selectedBatch, val);
    loadAttendanceHistory(selectedBatch);
  };

  const handleBatchChangeManager = async (val) => {
    setSelectedBatch(val);
    setManagerLoading(true);
    setManagerError('');
    try {
      const { data } = await listStudents({ limit: 500, batchId: val });
      const mapped = (data.students || []).map(s => ({ id: s.studentId || s._id || s.id, name: s.name, status: 'present', reason: '' }));
      setManagerStudents(mapped);
      setStudentNameMap(new Map(mapped.map(s => [s.id, s.name])));
      loadDraftIfAvailable(val, selectedDate);
      loadAttendanceHistory(val);
      await loadOverview(val);
    } catch (err) {
      setManagerError(err.response?.data?.error || err.message);
    } finally {
      setManagerLoading(false);
    }
  };

  const loadAttendanceHistory = async (batchIdVal) => {
    if (!batchIdVal) { setAttendanceHistory([]); return; }
    try {
      const { data } = await listAttendance({ batchId: batchIdVal });
      const grouped = (data.attendance || []).reduce((acc, log) => {
        acc[log.date] = acc[log.date] || { date: log.date, present: 0, absent: 0, excused: 0 };
        if (log.status === 'present') acc[log.date].present++;
        if (log.status === 'absent') acc[log.date].absent++;
        if (log.status === 'excused') acc[log.date].excused++;
        return acc;
      }, {});
      const sorted = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date)).slice(-5);
      setAttendanceHistory(sorted);
    } catch {}
  };

  const draftKey = (batchIdVal, dateVal) => `attendanceDraft:${batchIdVal}:${dateVal}`;
  const saveDraft = () => {
    if (!selectedBatch) return;
    const draft = managerStudents.map(s => ({ studentId: s.id, status: s.status, reason: s.reason || '' }));
    localStorage.setItem(draftKey(selectedBatch, selectedDate), JSON.stringify(draft));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };
  const loadDraftIfAvailable = (batchIdVal, dateVal) => {
    const raw = localStorage.getItem(draftKey(batchIdVal, dateVal));
    if (!raw) return;
    try {
      const entries = JSON.parse(raw);
      const map = new Map(entries.map(e => [e.studentId, e]));
      setManagerStudents(prev => prev.map(s => {
        const d = map.get(s.id);
        return d ? { ...s, status: d.status, reason: d.reason } : s;
      }));
    } catch {}
  };

  const markAll = (status) => {
    setManagerStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const filteredManagerStudents = managerStudents.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const submitAttendance = async () => {
    setManagerSuccess('');
    setManagerError('');
    if (!selectedBatch) {
      setManagerError('Please select a batch');
      return;
    }
    if (dateError) {
      setManagerError('Please fix date errors before submitting');
      return;
    }
    const entries = managerStudents.map(s => ({ studentId: s.id, status: s.status === 'on_leave' ? 'excused' : s.status, reason: s.reason || '' }));
    if (entries.length === 0) {
      setManagerError('No students to submit');
      return;
    }
    setManagerLoading(true);
    try {
      const { data } = await uploadAttendanceBulk({ date: selectedDate, batchId: selectedBatch || '', entries });
      setManagerSuccess(`Attendance submitted successfully (${data.count})`);
    } catch (err) {
      setManagerError(err.response?.data?.error || err.message);
    } finally {
      setManagerLoading(false);
    }
  };

  const loadOverview = async (batchIdVal) => {
    if (!batchIdVal) { setOverviewRows([]); return; }
    setOverviewLoading(true);
    setOverviewError('');
    try {
      const [{ data: attendanceData }, { data: studentsData }] = await Promise.all([
        listAttendance({ batchId: batchIdVal }),
        listStudents({ limit: 1000, batchId: batchIdVal })
      ]);
      const map = new Map((studentsData.students || []).map(s => [s.studentId || s._id || s.id, s.name]));
      setStudentNameMap(map);
      const grouped = (attendanceData.attendance || []).reduce((acc, log) => {
        const arr = acc.get(log.date) || [];
        arr.push(log);
        acc.set(log.date, arr);
        return acc;
      }, new Map());
      const rows = Array.from(grouped.entries()).map(([date, logs]) => {
        const present = logs.filter(l => l.status === 'present').length;
        const absentLogs = logs.filter(l => l.status === 'absent');
        const excused = logs.filter(l => l.status === 'excused').length;
        const absentNames = absentLogs.map(l => map.get(l.studentId) || l.studentId);
        return { date, present, absent: absentLogs.length, excused, absentNames };
      }).sort((a, b) => a.date.localeCompare(b.date));
      setOverviewRows(rows);
    } catch (err) {
      setOverviewError(err.response?.data?.error || err.message);
    } finally {
      setOverviewLoading(false);
    }
  };

  const exportOverviewPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Attendance Overview', 14, 16);
    const head = [['Date', 'Present', 'Absent', 'On Leave']];
    const body = overviewRows.map(r => [r.date, String(r.present), String(r.absent), String(r.excused)]);
    autoTable(doc, { head, body, startY: 22 });
    let y = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(12);
    doc.text('Absent Students by Date', 14, y);
    y += 4;
    overviewRows.forEach(r => {
      const names = r.absentNames && r.absentNames.length ? r.absentNames.join(', ') : '-';
      autoTable(doc, { head: [[r.date]], body: [[names]], startY: y, styles: { fontSize: 10 }, columnStyles: { 0: { cellWidth: 180 } } });
      y = doc.lastAutoTable.finalY + 6;
    });
    doc.save(`attendance_overview_${selectedBatch || 'all'}.pdf`);
  };

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

        <div className="flex items-center gap-3 mt-4">
          <motion.button 
            className="border border-bw-37 rounded px-3 py-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setManagerOpen(true);
              const defaultBatch = selectedBatch || (batches[0]?.id || '');
              if (defaultBatch) handleBatchChangeManager(defaultBatch);
              loadAttendanceHistory(defaultBatch);
            }}
            aria-haspopup="dialog"
          >
            Open Attendance Manager
          </motion.button>
          <motion.button 
            className="border border-bw-37 rounded px-3 py-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => loadOverview(selectedBatch || (batches[0]?.id || ''))}
          >
            Load Batch Overview
          </motion.button>
          <motion.button 
            className="border border-bw-37 rounded px-3 py-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportOverviewPdf}
            disabled={!overviewRows.length}
          >
            Export Overview PDF
          </motion.button>
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
            {batches.map(batch => (
              <option key={batch.id} value={batch.id}>{batch.name}</option>
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
          <motion.button 
            className="border border-bw-37 rounded px-3 py-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              try {
                setLoading(true);
                setError('');
                setSaveMessage('');
                const entries = students.map(s => ({ studentId: s.id, status: s.status }));
                const payload = { date: selectedDate, batchId: selectedBatch || '', entries };
                const { data } = await uploadAttendanceBulk(payload);
                setSaveMessage(`Attendance saved (${data.count})`);
              } catch (err) {
                setError(err.response?.data?.error || err.message);
              } finally {
                setLoading(false);
              }
            }}
          >
            Save Attendance
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
      {saveMessage && (
        <div className="border border-bw-37 rounded-lg bg-black p-3 text-bw-62">{saveMessage}</div>
      )}

      {/* Batch Overview Table */}
      <div className="border border-bw-37 rounded-lg bg-black p-4">
        <h3 className="font-comic mb-2">Batch Overview</h3>
        {overviewLoading && <div className="text-bw-62">Loading overview...</div>}
        {overviewError && <div className="text-bw-62">{overviewError}</div>}
        {!overviewLoading && !overviewError && overviewRows.length === 0 && (
          <div className="text-bw-62">No attendance records for selected batch</div>
        )}
        {overviewRows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Present</th>
                  <th className="px-3 py-2">Absent</th>
                  <th className="px-3 py-2">On Leave</th>
                  <th className="px-3 py-2">Absent Students</th>
                </tr>
              </thead>
              <tbody>
                {overviewRows.map(r => (
                  <tr key={r.date}>
                    <td className="px-3 py-2">{r.date}</td>
                    <td className="px-3 py-2">{r.present}</td>
                    <td className="px-3 py-2">{r.absent}</td>
                    <td className="px-3 py-2">{r.excused}</td>
                    <td className="px-3 py-2">{(r.absentNames || []).join(', ') || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
      {/* Attendance Manager Modal */}
      <AnimatePresence>
        {managerOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onKeyDown={(e) => { if (e.key === 'Escape') setManagerOpen(false); }}
          >
            <motion.div 
              role="dialog" aria-modal="true" aria-labelledby="attendance-manager-title"
              className="border border-bw-37 bg-black text-white rounded-lg p-6 w-full max-w-4xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 id="attendance-manager-title" className="font-comic text-xl">Attendance Manager</h2>
                <button className="border border-bw-37 rounded p-2" onClick={() => setManagerOpen(false)} aria-label="Close"><X size={20} /></button>
              </div>
              {managerError && <div className="border border-bw-37 rounded p-3 mb-3 text-bw-62">{managerError}</div>}
              {managerSuccess && <div className="border border-bw-75 rounded p-3 mb-3 text-bw-75">{managerSuccess}</div>}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-sm mb-1">Batch</label>
                  <select ref={batchSelectRef} value={selectedBatch} onChange={(e) => handleBatchChangeManager(e.target.value)} className="bg-black border border-bw-37 rounded px-3 py-2 w-full" aria-label="Select batch">
                    <option value="">Select Batch</option>
                    {batches.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Date</label>
                  <input type="date" value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} className="bg-black border border-bw-37 rounded px-3 py-2 w-full" aria-label="Select date" />
                  {dateError && <div className="text-bw-62 text-sm mt-1" role="alert">{dateError}</div>}
                </div>
                <div className="flex items-end gap-2">
                  <button className="border border-bw-37 rounded px-3 py-2" onClick={() => markAll('present')}>Mark All Present</button>
                  <button className="border border-bw-37 rounded px-3 py-2" onClick={() => markAll('absent')}>Mark All Absent</button>
                  <button className="border border-bw-37 rounded px-3 py-2" onClick={() => markAll('on_leave')}>Mark All On Leave</button>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Search size={18} />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search students" className="bg-black border border-bw-37 rounded px-3 py-2 w-full" aria-label="Search students" />
              </div>
              <div className="border border-bw-37 rounded">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Reason (optional)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managerLoading ? (
                      <tr><td className="px-3 py-2" colSpan="3">Loading students...</td></tr>
                    ) : filteredManagerStudents.length ? (
                      filteredManagerStudents.map(s => (
                        <tr key={s.id}>
                          <td className="px-3 py-2">{s.name}</td>
                          <td className="px-3 py-2">
                            <select value={s.status} onChange={(e) => setManagerStudents(prev => prev.map(x => x.id === s.id ? { ...x, status: e.target.value } : x))} className="bg-black border border-bw-37 rounded px-2 py-1">
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="on_leave">On Leave</option>
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input type="text" value={s.reason || ''} onChange={(e) => setManagerStudents(prev => prev.map(x => x.id === s.id ? { ...x, reason: e.target.value } : x))} className="bg-black border border-bw-37 rounded px-2 py-1 w-full" placeholder="Optional" />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td className="px-3 py-2" colSpan="3">No students found for selected batch</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button className="border border-bw-37 rounded px-3 py-2" onClick={saveDraft}>Save Draft</button>
                {draftSaved && <span className="text-bw-62">Draft saved</span>}
                <button className="border border-bw-37 rounded px-3 py-2" onClick={submitAttendance} disabled={managerLoading || !!dateError}>Submit Attendance</button>
              </div>
              <div className="mt-6">
                <h3 className="font-comic mb-2">Attendance History</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {attendanceHistory.map(h => (
                    <div key={h.date} className="border border-bw-37 rounded p-3">
                      <div className="text-sm text-bw-75">{h.date}</div>
                      <div className="flex gap-3 text-sm">
                        <span>Present: {h.present}</span>
                        <span>Absent: {h.absent}</span>
                        <span>On Leave: {h.excused}</span>
                      </div>
                    </div>
                  ))}
                  {!attendanceHistory.length && (
                    <div className="text-bw-62">No history for this batch</div>
                  )}
                </div>
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