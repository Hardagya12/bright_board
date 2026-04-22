import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Eye, Pencil, Trash2, Mail as MailIcon, Download as DownloadIcon, Users as GroupIcon, UserPlus, Plus, Search, X, CheckCircle, AlertCircle } from 'lucide-react';
import { FaUserGraduate, FaChartPie, FaUserCheck, FaUserTimes, FaTrophy } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Upload } from 'lucide-react';
import { listStudents, createStudent } from '../../utils/services/students';
import { listBatches, createBatch } from '../../utils/services/batches';
import { getAttendanceStats } from '../../utils/services/attendance';
import { getResultsAnalytics } from '../../utils/services/results';
import api from '../../utils/api';

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
        >
          <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const InputGroup = ({ label, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">{label}</label>
    <input
      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
      {...props}
    />
  </div>
);

const SelectGroup = ({ label, children, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">{label}</label>
    <select
      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none"
      {...props}
    >
      {children}
    </select>
  </div>
);
const StudentManagementPage = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [overview, setOverview] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ batch: '', course: '', attendance: '', status: '' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    course: '',
    attendance: '',
    status: '',
    batch: ''
  });
  const rowsPerPage = 8;
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    course: '',
    batchId: ''
  });
  const [batches, setBatches] = useState([]);
  const [error, setError] = useState('');
  const [createdStudent, setCreatedStudent] = useState(null);
  const [addBatchOpen, setAddBatchOpen] = useState(false);
  const [batchError, setBatchError] = useState('');
  const [newBatch, setNewBatch] = useState({ name: '', course: '', startDate: '', endDate: '', capacity: 30 });

  // CSV Import
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvResult, setCsvResult] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Fetch independently so one failure doesn't break the entire page
        let s = { students: [] }, att = { weekly: [] }, resAn = { trend: [] }, b = { batches: [] };

        try { const { data } = await listStudents({ limit: 100 }); s = data || s; } catch (e) { console.error('Students error', e); }
        try { const { data } = await getAttendanceStats({ range: 'week' }); att = data || att; } catch (e) { console.error('Attendance error', e); }
        try { const { data } = await getResultsAnalytics(); resAn = data || resAn; } catch (e) { console.error('Results error', e); }
        try { const { data } = await listBatches({ limit: 100 }); b = data || b; } catch (e) { console.error('Batches error', e); }

        const studentData = (s.students || []).map(st => ({
          id: st.studentId || st.id || st._id,
          name: st.name,
          email: st.email,
          phone: st.phone,
          course: st.course,
          attendance: 0,
          status: (st.status || '').toLowerCase() === 'active' ? 'Active' : 'Inactive',
          batch: st.batchId || '',
        }));
        setStudents(studentData);
        setFilteredStudents(studentData);
        const activeCount = studentData.filter(x => x.status === 'Active').length;
        const overviewData = {
          totalStudents: studentData.length,
          activeStudents: activeCount,
          inactiveStudents: studentData.length - activeCount,
          growthTrend: 0,
        };
        setOverview(overviewData);
        const attendanceData = att.weekly?.length ? [
          { name: 'Present', value: Math.round(att.weekly.slice(-1)[0].attendance) },
          { name: 'Absent', value: 100 - Math.round(att.weekly.slice(-1)[0].attendance) },
          { name: 'Late', value: 0 },
        ] : [];
        const progressData = (resAn.trend || []).map(t => ({ month: t.month, grade: t.average }));
        setChartData({ attendanceData, progressData, colors: ['#10b981', '#f87171', '#fbbf24'] });
        const bb = (b.batches || []).map(x => ({ id: x.batchId || x.id || x._id, name: x.name, course: x.course }));
        setBatches(bb);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!students.length) return;
    const filtered = students.filter(student => (
      (student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toString().includes(searchQuery)) &&
      (filters.batch === '' || student.batch === filters.batch) &&
      (filters.course === '' || student.course === filters.course) &&
      (filters.attendance === '' || student.attendance >= parseInt(filters.attendance)) &&
      (filters.status === '' || student.status === filters.status)
    ));
    setFilteredStudents(filtered);
    setPage(1);
  }, [searchQuery, filters, students]);

  const getPaginatedStudents = () =>
    filteredStudents.length > 0
      ? filteredStudents.slice((page - 1) * rowsPerPage, page * rowsPerPage)
      : [];

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setEditForm({
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      course: student.course,
      attendance: student.attendance,
      status: student.status,
      batch: student.batch
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    const updatedStudents = students.map(student =>
      student.id === editForm.id ? { ...student, ...editForm } : student
    );
    setStudents(updatedStudents);
    setFilteredStudents(updatedStudents);
    setEditModalOpen(false);
    setSelectedStudent(null);
  };

  const handleDelete = (student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    const updatedStudents = students.filter(student => student.id !== selectedStudent.id);
    setStudents(updatedStudents);
    setFilteredStudents(updatedStudents);
    setDeleteDialogOpen(false);
    setSelectedStudent(null);
  };

  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setDrawerOpen(true);
  };

  const handleBulkAction = async (action) => {
    console.log(`${action} triggered for all students`);
  };

  const handleCsvFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      setCsvHeaders(headers);
      const rows = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
        return obj;
      });
      setCsvData(rows);
      setCsvResult(null);
    };
    reader.readAsText(file);
  };

  const handleCsvImport = async () => {
    setCsvImporting(true);
    try {
      const payload = csvData.map(row => ({
        name: row.name || row.student_name || '',
        email: row.email || row.student_email || '',
        phone: row.phone || row.mobile || row.contact || '',
        dateOfBirth: row.dob || row.date_of_birth || row.dateofbirth || '',
        address: row.address || '',
        course: row.course || row.program || '',
        batchId: row.batch || row.batchid || row.batch_id || '',
      }));
      const { data } = await api.post('/students/bulk-import', { students: payload });
      setCsvResult(data);
      if (data.created > 0) {
        // Reload students
        const { data: s } = await listStudents({ limit: 100 });
        const studentData = (s.students || []).map(st => ({
          id: st.studentId || st.id || st._id,
          name: st.name, email: st.email, phone: st.phone,
          course: st.course, attendance: 0, status: 'Active', batch: st.batchId || ''
        }));
        setStudents(studentData);
        setFilteredStudents(studentData);
      }
    } catch (err) {
      setCsvResult({ error: err.response?.data?.error || err.message });
    } finally {
      setCsvImporting(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await createStudent(newStudent);
      const st = data.student || {};
      const mapped = {
        id: st.id,
        name: st.name,
        email: st.email,
        phone: st.phone,
        course: st.course,
        attendance: 0,
        status: 'Active',
        batch: st.batchId || ''
      };
      const updated = [mapped, ...students];
      setStudents(updated);
      setFilteredStudents(updated);
      setAddModalOpen(false);
      setCreatedStudent({ name: st.name, id: data.studentId });
      setNewStudent({ name: '', email: '', phone: '', dateOfBirth: '', address: '', course: '', batchId: '' });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const OverviewSection = () => {
    const cards = [
      { title: 'Total Students', value: overview?.totalStudents || 0, icon: FaUserGraduate, color: 'primary' },
      { title: 'Active Students', value: overview?.activeStudents || 0, icon: FaUserCheck, color: 'success' },
      { title: 'Inactive Students', value: overview?.inactiveStudents || 0, icon: FaUserTimes, color: 'danger' },
      { title: 'Growth Trend', value: `${overview?.growthTrend || 0}%`, icon: FaTrophy, color: 'warning' }
    ];
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((item, index) => (
          <Card key={index} variant="glass" className="p-0">
            <div className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-white/5 ${item.color === 'primary' ? 'text-blue-400' :
                  item.color === 'success' ? 'text-emerald-400' :
                    item.color === 'danger' ? 'text-red-400' : 'text-amber-400'
                }`}>
                <item.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-white/50 font-medium">{item.title}</p>
                <p className="text-2xl font-bold text-white">{item.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const FilterSection = () => (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-3 text-white/40" size={18} />
        <input
          type="text"
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
        {['batch', 'course', 'status'].map((filter) => (
          <select
            key={filter}
            value={filters[filter]}
            onChange={(e) => setFilters({ ...filters, [filter]: e.target.value })}
            className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none min-w-[140px]"
          >
            <option value="">All {filter.charAt(0).toUpperCase() + filter.slice(1)}s</option>
            {filter === 'batch' && batches.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            {filter === 'course' && ['CS101', 'ME201', 'EE301'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
            {filter === 'status' && ['Active', 'Inactive'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ))}
      </div>
    </div>
  );

  const StudentTable = () => (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wider">
            <tr>
              {['Name', 'Email', 'Phone', 'Course', 'Attendance', 'Status', 'Actions'].map(header => (
                <th key={header} className="px-6 py-4 font-medium border-b border-white/10">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr><td className="px-6 py-8 text-center text-white/50" colSpan="7">Loading students...</td></tr>
            ) : getPaginatedStudents().length > 0 ? (
              getPaginatedStudents().map((student) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{student.name}</div>
                    <div className="text-xs text-white/40">ID: {student.id}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/70">{student.email}</td>
                  <td className="px-6 py-4 text-sm text-white/70">{student.phone}</td>
                  <td className="px-6 py-4 text-sm text-white/70">
                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs">
                      {student.course}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${student.attendance}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/60">{student.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${student.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleViewProfile(student)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-blue-400 transition-colors"><Eye size={16} /></button>
                      <button onClick={() => handleEdit(student)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-amber-400 transition-colors"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(student)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr><td className="px-6 py-8 text-center text-white/40" colSpan="7">No students found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredStudents.length > 0 && (
        <div className="p-4 border-t border-white/10 flex justify-between items-center">
          <div className="text-sm text-white/40">
            Showing {((page - 1) * rowsPerPage) + 1} to {Math.min(page * rowsPerPage, filteredStudents.length)} of {filteredStudents.length}
          </div>
          <div className="flex gap-2">
            {Array(Math.ceil(filteredStudents.length / rowsPerPage)).fill().map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === i + 1
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const ChartsSection = () => (
    chartData && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="glass" className="h-[350px]">
          <h3 className="text-lg font-semibold text-white mb-6">Attendance Distribution</h3>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={chartData.attendanceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.attendanceData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={chartData.colors[index]} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card variant="glass" className="h-[350px]">
          <h3 className="text-lg font-semibold text-white mb-6">Performance Trends</h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={chartData.progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="month" stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="grade"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    )
  );


  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Student Management</h1>
              <p className="text-white/50">Manage student records, enrollments, and performance.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => handleBulkAction('Export')}>
                <DownloadIcon size={18} className="mr-2" /> Export
              </Button>
              <Button variant="secondary" onClick={() => setCsvModalOpen(true)}>
                <Upload size={18} className="mr-2" /> CSV Import
              </Button>
              <Button variant="accent" onClick={() => setAddModalOpen(true)}>
                <UserPlus size={18} className="mr-2" /> Add Student
              </Button>
            </div>
          </div>

          <OverviewSection />
          <FilterSection />
          <StudentTable />
          <ChartsSection />

          <div className="flex gap-4 flex-wrap">
            <Button variant="secondary" onClick={() => setAddBatchOpen(true)}>
              <Plus size={18} className="mr-2" /> Create New Batch
            </Button>
            <Button variant="secondary" onClick={() => handleBulkAction('Reminder')}>
              <MailIcon size={18} className="mr-2" /> Send Bulk Reminders
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Student Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Student">
        <form className="space-y-4">
          <InputGroup label="Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <InputGroup label="Email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
          <InputGroup label="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <SelectGroup label="Course" value={editForm.course} onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}>
              <option value="">Select Course</option>
              {['CS101', 'ME201', 'EE301'].map(c => <option key={c} value={c}>{c}</option>)}
            </SelectGroup>
            <SelectGroup label="Status" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </SelectGroup>
          </div>
          <SelectGroup label="Batch" value={editForm.batch} onChange={(e) => setEditForm({ ...editForm, batch: e.target.value })}>
            <option value="">Select Batch</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </SelectGroup>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button variant="accent" onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Add Student Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Student">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        <form onSubmit={handleAddStudent} className="space-y-4">
          <InputGroup label="Name" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} required />
          <InputGroup label="Email" type="email" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Phone" value={newStudent.phone} onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })} required />
            <InputGroup label="DOB" type="date" value={newStudent.dateOfBirth} onChange={(e) => setNewStudent({ ...newStudent, dateOfBirth: e.target.value })} required />
          </div>
          <InputGroup label="Address" value={newStudent.address} onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Course" value={newStudent.course} onChange={(e) => setNewStudent({ ...newStudent, course: e.target.value })} required />
            <SelectGroup label="Batch" value={newStudent.batchId} onChange={(e) => setNewStudent({ ...newStudent, batchId: e.target.value })}>
              <option value="">Select Batch</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </SelectGroup>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="accent">Create Student</Button>
          </div>
        </form>
      </Modal>

      {/* Add Batch Modal */}
      <Modal isOpen={addBatchOpen} onClose={() => setAddBatchOpen(false)} title="Create New Batch">
        {batchError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {batchError}
          </div>
        )}
        <form onSubmit={async (e) => {
          e.preventDefault();
          setBatchError('');
          try {
            const { data } = await createBatch(newBatch);
            const nb = { id: data.batch?.id || data.batchId, name: data.batch?.name || newBatch.name };
            setBatches([nb, ...batches]);
            setAddBatchOpen(false);
            setNewBatch({ name: '', course: '', startDate: '', endDate: '', capacity: 30 });
          } catch (err) {
            setBatchError(err.response?.data?.error || err.message);
          }
        }} className="space-y-4">
          <InputGroup label="Batch Name" value={newBatch.name} onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })} required />
          <InputGroup label="Course" value={newBatch.course} onChange={(e) => setNewBatch({ ...newBatch, course: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Start Date" type="date" value={newBatch.startDate} onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })} required />
            <InputGroup label="End Date" type="date" value={newBatch.endDate} onChange={(e) => setNewBatch({ ...newBatch, endDate: e.target.value })} required />
          </div>
          <InputGroup label="Capacity" type="number" value={newBatch.capacity} onChange={(e) => setNewBatch({ ...newBatch, capacity: parseInt(e.target.value) })} required />
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setAddBatchOpen(false)}>Cancel</Button>
            <Button type="submit" variant="accent">Create Batch</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal isOpen={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} title="Confirm Deletion">
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} className="text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Delete Student?</h3>
          <p className="text-white/60 mb-6">
            Are you sure you want to delete <span className="text-white font-semibold">{selectedStudent?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete Student</Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={!!createdStudent} onClose={() => setCreatedStudent(null)} title="Success">
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Student Created!</h3>
          <p className="text-white/60 mb-6">
            <span className="text-white font-semibold">{createdStudent?.name}</span> has been successfully added to the system.
          </p>
          <Button variant="primary" onClick={() => setCreatedStudent(null)} fullWidth>Done</Button>
        </div>
      </Modal>

      {/* View Profile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 w-full max-w-md bg-[#121212] border-l border-white/10 z-50 p-6 shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">Student Profile</h2>
                <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} className="text-white/70" />
                </button>
              </div>

              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg shadow-blue-500/20">
                  {selectedStudent?.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-white">{selectedStudent?.name}</h3>
                <p className="text-white/50">{selectedStudent?.email}</p>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Academic Info</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-white/50 mb-1">Student ID</p>
                      <p className="text-sm font-medium text-white font-mono">{selectedStudent?.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50 mb-1">Batch</p>
                      <p className="text-sm font-medium text-white">{selectedStudent?.batch || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50 mb-1">Course</p>
                      <p className="text-sm font-medium text-white">{selectedStudent?.course}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50 mb-1">Status</p>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs border ${selectedStudent?.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                        {selectedStudent?.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Contact Details</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-white/50 mb-1">Phone Number</p>
                      <p className="text-sm font-medium text-white">{selectedStudent?.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50 mb-1">Address</p>
                      <p className="text-sm font-medium text-white">{selectedStudent?.address || 'No address provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <Button variant="outline" fullWidth onClick={() => {
                  setDrawerOpen(false);
                  handleEdit(selectedStudent);
                }}>
                  <Pencil size={16} className="mr-2" /> Edit Profile
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CSV Import Modal */}
      <Modal isOpen={csvModalOpen} onClose={() => { setCsvModalOpen(false); setCsvData([]); setCsvResult(null); }} title="Bulk Import Students">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/5 border border-dashed border-white/20 text-center">
            <Upload size={24} className="mx-auto text-white/40 mb-2" />
            <p className="text-white/60 text-sm mb-3">Upload a CSV file with columns: name, email, phone, dob, address, course, batch</p>
            <input type="file" accept=".csv" onChange={handleCsvFile}
              className="text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-600 file:text-white file:cursor-pointer" />
          </div>

          {csvData.length > 0 && !csvResult && (
            <>
              <div className="text-sm text-white/60">{csvData.length} students found in CSV</div>
              <div className="max-h-[200px] overflow-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-white/50 sticky top-0">
                    <tr>{csvHeaders.slice(0, 5).map(h => <th key={h} className="px-3 py-2 capitalize">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {csvData.slice(0, 10).map((row, i) => (
                      <tr key={i} className="text-white/70">
                        {csvHeaders.slice(0, 5).map(h => <td key={h} className="px-3 py-1.5">{row[h]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvData.length > 10 && <div className="p-2 text-center text-white/30 text-xs">...and {csvData.length - 10} more</div>}
              </div>
              <Button variant="accent" onClick={handleCsvImport} disabled={csvImporting} className="w-full">
                {csvImporting ? 'Importing...' : `Import ${csvData.length} Students`}
              </Button>
            </>
          )}

          {csvResult && (
            <div className="space-y-3">
              {csvResult.error ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{csvResult.error}</div>
              ) : (
                <>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                    ✅ {csvResult.created} students imported successfully
                  </div>
                  {csvResult.skipped > 0 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                      ⚠️ {csvResult.skipped} skipped
                      {csvResult.errors?.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs">
                          {csvResult.errors.slice(0, 5).map((e, i) => <li key={i}>Row {e.row}: {e.error}</li>)}
                        </ul>
                      )}
                    </div>
                  )}
                  <Button variant="secondary" onClick={() => { setCsvModalOpen(false); setCsvData([]); setCsvResult(null); }} className="w-full">
                    Done
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default StudentManagementPage;