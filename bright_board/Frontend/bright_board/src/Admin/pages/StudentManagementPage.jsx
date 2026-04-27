import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Eye, Pencil, Trash2, Mail as MailIcon, Download as DownloadIcon, Users as GroupIcon, UserPlus, Plus, Search, X, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { FaUserGraduate, FaChartPie, FaUserCheck, FaUserTimes, FaTrophy } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { listStudents, createStudent } from '../../utils/services/students';
import { listBatches, createBatch } from '../../utils/services/batches';
import { getAttendanceStats } from '../../utils/services/attendance';
import { getResultsAnalytics } from '../../utils/services/results';
import api from '../../utils/api';
import { BackpackSVG, RulerSVG, StarSVG, BookSVG, CalculatorSVG } from '../../components/svg/SchoolIllustrations';

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 bg-[var(--bb-offwhite)]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-body"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bb-card w-full max-w-lg overflow-hidden shadow-2xl relative"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
        >
          <div className="absolute top-0 left-[10%] right-[10%] h-[4px] bg-[#9fe870] rounded-b-full"></div>
          <div className="px-6 py-4 border-b border-[#e8ebe6] flex justify-between items-center bg-[#f9faf6]">
            <h2 className="text-xl font-bold text-[#0e0f0c] font-display tracking-tight">{title}</h2>
            <button onClick={onClose} className="text-[#868685] hover:text-[#d03238] transition-colors p-2 bg-[#e8ebe6] rounded-full">
              <X size={20} />
            </button>
          </div>
          <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar bg-white">
            {children}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const InputGroup = ({ label, ...props }) => (
  <div className="space-y-1.5 font-body">
    <label className="text-[12px] font-bold text-[#454745] uppercase tracking-wider">{label}</label>
    <input
      className="input-wise"
      {...props}
    />
  </div>
);

const SelectGroup = ({ label, children, ...props }) => (
  <div className="space-y-1.5 font-body">
    <label className="text-[12px] font-bold text-[#454745] uppercase tracking-wider">{label}</label>
    <select
      className="input-wise appearance-none cursor-pointer"
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
    id: '', name: '', email: '', phone: '', course: '', attendance: '', status: '', batch: ''
  });
  const rowsPerPage = 8;
  const [newStudent, setNewStudent] = useState({
    name: '', email: '', phone: '', dateOfBirth: '', address: '', course: '', batchId: ''
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
        ] : [];
        const progressData = (resAn.trend || []).map(t => ({ month: t.month, grade: t.average }));
        // Wise colors
        setChartData({ attendanceData, progressData, colors: ['#9fe870', '#ffd11a', '#ffc091'] });
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
      id: student.id, name: student.name, email: student.email, phone: student.phone,
      course: student.course, attendance: student.attendance, status: student.status, batch: student.batch
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
    // TODO: Implement bulk actions (Export, Reminder)
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
        id: st.id, name: st.name, email: st.email, phone: st.phone,
        course: st.course, attendance: 0, status: 'Active', batch: st.batchId || ''
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
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bb-card p-6 animate-pulse">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-xl bg-[#e8ebe6]" />
                <div className="flex-1">
                  <div className="h-3 w-20 rounded-full bg-[#e8ebe6] mb-3" />
                  <div className="h-7 w-12 rounded-full bg-[#e8ebe6]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    const cards = [
      { title: 'Total Students', value: overview?.totalStudents || 0, icon: FaUserGraduate, color: 'green' },
      { title: 'Active Students', value: overview?.activeStudents || 0, icon: FaUserCheck, color: 'yellow' },
      { title: 'Inactive Students', value: overview?.inactiveStudents || 0, icon: FaUserTimes, color: 'red' },
      { title: 'Growth Trend', value: `${overview?.growthTrend || 0}%`, icon: FaTrophy, color: 'blue' }
    ];
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((item, index) => (
          <Card key={index} variant="default" accentColor={item.color} className="p-0 overflow-hidden relative group">
            <div className="p-6 flex items-center gap-5 relative z-10">
              <div className={`p-4 rounded-xl border border-[rgba(14,15,12,0.12)] ${
                item.color === 'green' ? 'bg-[#e2f6d5] text-[#163300]' :
                item.color === 'yellow' ? 'bg-[#fff8e0] text-[#8a6d00]' :
                item.color === 'red' ? 'bg-[#ffeaea] text-[#d03238]' :
                'bg-[#e8f4ff] text-[#0066cc]'
                }`}>
                <item.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#868685]">{item.title}</p>
                <p className="text-3xl font-bold text-[#0e0f0c] mt-1 font-display tracking-tight">{item.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const FilterSection = () => (
    <Card variant="default" className="flex flex-col md:flex-row gap-4 p-5">
      <div className="flex-1 relative">
        <Search className="absolute left-5 top-[18px] text-[#868685]" size={18} />
        <input
          type="text"
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-wise pl-[48px]"
        />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 font-body text-sm">
        {['batch', 'course', 'status'].map((filter) => (
          <select
            key={filter}
            value={filters[filter]}
            onChange={(e) => setFilters({ ...filters, [filter]: e.target.value })}
            className="input-wise min-w-[140px] appearance-none"
          >
            <option value="">All {filter}</option>
            {filter === 'batch' && batches.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            {filter === 'course' && ['CS101', 'ME201', 'EE301'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
            {filter === 'status' && ['Active', 'Inactive'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ))}
      </div>
    </Card>
  );

  const StudentTable = () => (
    <Card variant="default" className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#f9faf6] text-[#868685] text-xs font-bold uppercase tracking-widest border-b border-[#e8ebe6]">
            <tr>
              {['Identity', 'Contact', 'Program', 'Attendance', 'Status', 'Actions'].map(header => (
                <th key={header} className="px-6 py-4">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8ebe6] font-body text-sm">
            {isLoading ? (
              <tr><td className="px-6 py-12 text-center text-[#868685] font-bold" colSpan="6">Loading Data...</td></tr>
            ) : getPaginatedStudents().length > 0 ? (
              getPaginatedStudents().map((student) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-[#f9faf6] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#0e0f0c] tracking-wide text-base">{student.name}</div>
                    <div className="text-[11px] text-[#868685] font-bold uppercase mt-1">ID: {student.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[#454745] font-medium">{student.email}</div>
                    <div className="text-[12px] text-[#868685]">{student.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-[#f9faf6] border border-[#e8ebe6] text-[#454745] text-xs font-bold rounded-full">
                      {student.course}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-2 bg-[#e8ebe6] rounded-full overflow-hidden border border-[#e8ebe6]">
                        <div
                          className="h-full bg-[#9fe870]"
                          style={{ width: `${student.attendance}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#163300]">{student.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={student.status === 'Active' ? 'badge-green' : 'badge-danger'}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleViewProfile(student)} className="p-2 border border-[#e8ebe6] bg-white rounded-full hover:border-[#9fe870] hover:text-[#163300] transition-colors shadow-sm"><Eye size={16} /></button>
                      <button onClick={() => handleEdit(student)} className="p-2 border border-[#e8ebe6] bg-white rounded-full hover:border-[#9fe870] hover:text-[#163300] transition-colors shadow-sm"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(student)} className="p-2 border border-[#e8ebe6] bg-white rounded-full hover:border-[#d03238] hover:text-[#d03238] hover:bg-[#ffeaea] transition-colors shadow-sm"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr><td className="px-6 py-12 text-center text-[#868685] font-bold" colSpan="6">No records found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredStudents.length > 0 && (
        <div className="p-4 border-t border-[#e8ebe6] flex justify-between items-center bg-[#f9faf6] font-body text-sm font-bold">
          <div className="text-[#868685]">
            Showing {((page - 1) * rowsPerPage) + 1}-{Math.min(page * rowsPerPage, filteredStudents.length)} of {filteredStudents.length}
          </div>
          <div className="flex gap-1">
            {Array(Math.ceil(filteredStudents.length / rowsPerPage)).fill().map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${page === i + 1
                    ? 'bg-[#9fe870] text-[#163300] border-transparent shadow-sm'
                    : 'bg-white border-[#e8ebe6] text-[#454745] hover:border-[#9fe870]'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );

  const ChartsSection = () => (
    chartData && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="default" className="h-[350px] relative">
          <h3 className="text-xl font-bold text-[#0e0f0c] mb-6 font-display tracking-tight">Attendance Stats</h3>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={chartData.attendanceData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.attendanceData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={chartData.colors[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e8ebe6', borderRadius: '16px', color: '#0e0f0c', fontWeight: 'bold', fontFamily: 'Inter' }}
                itemStyle={{ color: '#0e0f0c' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        
        <Card variant="default" className="h-[350px] relative">
          <h3 className="text-xl font-bold text-[#0e0f0c] mb-6 font-display tracking-tight">Performance Timeline</h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={chartData.progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8ebe6" vertical={false} />
              <XAxis dataKey="month" stroke="#868685" tick={{ fill: '#868685', fontSize: 12, fontFamily: 'Inter', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#868685" tick={{ fill: '#868685', fontSize: 12, fontFamily: 'Inter', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e8ebe6', borderRadius: '16px', color: '#0e0f0c', fontWeight: 'bold', fontFamily: 'Inter' }}
              />
              <Line
                type="monotone"
                dataKey="grade"
                stroke="#9fe870"
                strokeWidth={3}
                dot={{ fill: '#fff', stroke: '#163300', strokeWidth: 2, r: 4 }}
                activeDot={{ fill: '#9fe870', stroke: '#163300', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    )
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bb-offwhite)] font-body relative notebook-lines">
      {/* Decorative SVG Elements */}
      <div className="absolute top-[5%] right-[5%] hidden lg:block opacity-60">
        <BackpackSVG size={100} />
      </div>
      <div className="absolute bottom-[5%] left-[20%] hidden md:block opacity-50">
        <RulerSVG size={120} />
      </div>
      <div className="absolute top-[40%] left-[5%] hidden xl:block opacity-80">
        <StarSVG size={60} color="#9fe870" />
      </div>

      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-[#9fe870] scrollbar-track-transparent relative z-10">
        <div className="max-w-7xl mx-auto space-y-10">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#e8ebe6] pb-6 relative">
            <div className="relative">
              <h1 className="text-4xl md:text-5xl font-bold text-[#0e0f0c] tracking-tight font-display relative inline-block">
                Student Directory
                <div className="doodle-underline w-full absolute bottom-[-4px] left-0"></div>
              </h1>
              <p className="text-[#868685] font-bold text-sm mt-4 uppercase tracking-widest">Global Register & Analytics</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => handleBulkAction('Export')}>
                <DownloadIcon size={18} /> Export
              </Button>
              <Button variant="outline" onClick={() => setCsvModalOpen(true)}>
                <Upload size={18} /> Import
              </Button>
              <Button variant="primary" onClick={() => setAddModalOpen(true)}>
                <UserPlus size={18} /> New Student
              </Button>
            </div>
          </div>

          <OverviewSection />
          <FilterSection />
          <StudentTable />
          <ChartsSection />

          <div className="flex gap-4 flex-wrap border-t border-[#e8ebe6] pt-8 mt-8">
            <Button variant="secondary" onClick={() => setAddBatchOpen(true)}>
              <Plus size={18} /> Create Batch
            </Button>
            <Button variant="secondary" onClick={() => handleBulkAction('Reminder')}>
              <MailIcon size={18} /> Broadcast Message
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Student Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Student Record">
        <form className="space-y-5">
          <InputGroup label="Student Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <InputGroup label="Email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
          <InputGroup label="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <SelectGroup label="Program" value={editForm.course} onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}>
              <option value="">Select Program</option>
              {['CS101', 'ME201', 'EE301'].map(c => <option key={c} value={c}>{c}</option>)}
            </SelectGroup>
            <SelectGroup label="Status" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </SelectGroup>
          </div>
          <SelectGroup label="Batch ID" value={editForm.batch} onChange={(e) => setEditForm({ ...editForm, batch: e.target.value })}>
            <option value="">Select Batch</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </SelectGroup>
          <div className="pt-6 flex justify-end gap-3 font-bold">
            <Button type="button" variant="ghost" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button type="button" variant="primary" onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Add Student Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Register New Student">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#ffeaea] border border-[#d03238]/20 text-[#d03238] text-sm font-bold flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" /> {error}
          </div>
        )}
        <form onSubmit={handleAddStudent} className="space-y-5">
          <InputGroup label="Full Name" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} required />
          <InputGroup label="Email Address" type="email" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Phone Number" value={newStudent.phone} onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })} required />
            <InputGroup label="Date of Birth" type="date" value={newStudent.dateOfBirth} onChange={(e) => setNewStudent({ ...newStudent, dateOfBirth: e.target.value })} required />
          </div>
          <InputGroup label="Physical Address" value={newStudent.address} onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Program ID" value={newStudent.course} onChange={(e) => setNewStudent({ ...newStudent, course: e.target.value })} required />
            <SelectGroup label="Batch Assignment" value={newStudent.batchId} onChange={(e) => setNewStudent({ ...newStudent, batchId: e.target.value })}>
              <option value="">Select Batch</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </SelectGroup>
          </div>

          <div className="pt-6 flex justify-end gap-3 font-bold">
            <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Register Student</Button>
          </div>
        </form>
      </Modal>

      {/* Add Batch Modal */}
      <Modal isOpen={addBatchOpen} onClose={() => setAddBatchOpen(false)} title="Create New Batch">
        {batchError && (
          <div className="mb-6 p-4 rounded-xl bg-[#ffeaea] border border-[#d03238]/20 text-[#d03238] text-sm font-bold flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" /> {batchError}
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
        }} className="space-y-5">
          <InputGroup label="Batch Name" value={newBatch.name} onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })} required />
          <InputGroup label="Program" value={newBatch.course} onChange={(e) => setNewBatch({ ...newBatch, course: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Start Date" type="date" value={newBatch.startDate} onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })} required />
            <InputGroup label="End Date" type="date" value={newBatch.endDate} onChange={(e) => setNewBatch({ ...newBatch, endDate: e.target.value })} required />
          </div>
          <InputGroup label="Max Capacity" type="number" value={newBatch.capacity} onChange={(e) => setNewBatch({ ...newBatch, capacity: parseInt(e.target.value) })} required />
          <div className="pt-6 flex justify-end gap-3 font-bold">
            <Button type="button" variant="ghost" onClick={() => setAddBatchOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Batch</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal isOpen={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} title="Confirm Deletion">
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-[#ffeaea] border-4 border-[#d03238] rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 size={32} className="text-[#d03238]" />
          </div>
          <h3 className="text-xl font-bold text-[#d03238] mb-3 font-display tracking-tight">Delete Student?</h3>
          <p className="text-[#454745] mb-8 font-medium text-base">
            Are you sure you want to remove <span className="font-bold text-[#0e0f0c]">{selectedStudent?.name}</span>?<br/>
            This action cannot be undone.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Yes, Delete</Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={!!createdStudent} onClose={() => setCreatedStudent(null)} title="Success!">
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-[#e2f6d5] border-4 border-[#163300] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0_#163300] animate-bounce-gentle">
            <CheckCircle size={36} className="text-[#163300]" />
          </div>
          <h3 className="text-2xl font-bold text-[#0e0f0c] mb-3 font-display tracking-tight">Student Registered</h3>
          <p className="text-[#454745] mb-8 text-base font-medium">
            <span className="font-bold">{createdStudent?.name}</span> has been successfully added to the system.
          </p>
          <Button variant="primary" onClick={() => setCreatedStudent(null)} fullWidth>Done</Button>
        </div>
      </Modal>

      {/* View Profile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-[var(--bb-offwhite)]/40 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-[#e8ebe6] z-50 p-6 shadow-2xl overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="flex justify-between items-center mb-8 border-b border-[#e8ebe6] pb-4">
                <h2 className="text-xl font-bold text-[#0e0f0c] font-display tracking-tight">Student Profile</h2>
                <button onClick={() => setDrawerOpen(false)} className="p-2 bg-[#f9faf6] hover:bg-[#e8ebe6] rounded-full transition-colors">
                  <X size={20} className="text-[#868685]" />
                </button>
              </div>

              <div className="flex flex-col items-center mb-10 relative">
                <div className="w-32 h-32 rounded-full bg-[#e2f6d5] border-4 border-[#163300] flex items-center justify-center text-5xl font-display text-[#163300] mb-4 shadow-[4px_4px_0_#163300]">
                  {selectedStudent?.name.charAt(0)}
                </div>
                <h3 className="text-3xl font-bold text-[#0e0f0c] font-display tracking-tight">{selectedStudent?.name}</h3>
                <p className="text-[#868685] font-bold text-sm mt-1">{selectedStudent?.email}</p>
                <div className="mt-4">
                  <span className={selectedStudent?.status === 'Active' ? 'badge-green' : 'badge-danger'}>
                    {selectedStudent?.status}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 border border-[#e8ebe6] rounded-[24px] bg-[#f9faf6]">
                  <h4 className="text-sm font-bold text-[#0e0f0c] mb-4">Academic Details</h4>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                      <p className="text-[11px] text-[#868685] font-bold uppercase tracking-wider mb-1">Student ID</p>
                      <p className="text-sm font-bold text-[#0e0f0c] break-all">{selectedStudent?.id}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#868685] font-bold uppercase tracking-wider mb-1">Batch</p>
                      <p className="text-sm font-bold text-[#0e0f0c]">{selectedStudent?.batch || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#868685] font-bold uppercase tracking-wider mb-1">Program</p>
                      <p className="text-sm font-bold text-[#0e0f0c]">{selectedStudent?.course}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 border border-[#e8ebe6] rounded-[24px] bg-[#f9faf6]">
                  <h4 className="text-sm font-bold text-[#0e0f0c] mb-4">Contact Info</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] text-[#868685] font-bold uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-sm font-bold text-[#0e0f0c]">{selectedStudent?.phone}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#868685] font-bold uppercase tracking-wider mb-1">Address</p>
                      <p className="text-sm font-bold text-[#0e0f0c]">{selectedStudent?.address || 'Not Provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 mb-6">
                <Button variant="secondary" fullWidth onClick={() => {
                  setDrawerOpen(false);
                  handleEdit(selectedStudent);
                }}>
                  <Pencil size={18} /> Edit Profile
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CSV Import Modal */}
      <Modal isOpen={csvModalOpen} onClose={() => { setCsvModalOpen(false); setCsvData([]); setCsvResult(null); }} title="Import CSV Data">
        <div className="space-y-5">
          <div className="p-8 bg-[#f9faf6] border-2 border-dashed border-[#e8ebe6] rounded-[24px] text-center hover:border-[#9fe870] hover:bg-[#e2f6d5] transition-colors group cursor-pointer" onClick={() => document.getElementById('csv-upload').click()}>
            <Upload size={48} className="mx-auto text-[#868685] mb-4 group-hover:text-[#163300] transition-colors" />
            <p className="text-[#0e0f0c] font-bold mb-2 text-lg">Upload CSV File</p>
            <p className="text-[12px] text-[#868685] font-medium mb-4">Required: name, email, phone, dob, address, course, batch</p>
            <input id="csv-upload" type="file" accept=".csv" onChange={handleCsvFile} className="hidden" />
            <Button variant="secondary" className="pointer-events-none text-sm py-2 px-4">Browse Files</Button>
          </div>

          {csvData.length > 0 && !csvResult && (
            <>
              <div className="text-sm font-bold text-[#0e0f0c]">{csvData.length} records found</div>
              <div className="max-h-[250px] overflow-auto border border-[#e8ebe6] rounded-[16px] custom-scrollbar bg-white">
                <table className="w-full text-left text-xs font-medium">
                  <thead className="bg-[#f9faf6] text-[#868685] sticky top-0 uppercase tracking-widest font-bold">
                    <tr>{csvHeaders.slice(0, 5).map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8ebe6]">
                    {csvData.slice(0, 10).map((row, i) => (
                      <tr key={i} className="text-[#454745]">
                        {csvHeaders.slice(0, 5).map(h => <td key={h} className="px-4 py-3">{row[h]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvData.length > 10 && <div className="p-3 text-center text-[#868685] text-xs font-bold bg-[#f9faf6]">...and {csvData.length - 10} more</div>}
              </div>
              <Button variant="primary" fullWidth onClick={handleCsvImport} disabled={csvImporting}>
                {csvImporting ? 'Importing...' : `Import ${csvData.length} Records`}
              </Button>
            </>
          )}

          {csvResult && (
            <div className="space-y-4">
              {csvResult.error ? (
                <div className="p-4 rounded-xl bg-[#ffeaea] border border-[#d03238]/20 text-[#d03238] text-sm font-bold">
                  Error: {csvResult.error}
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-xl bg-[#e2f6d5] border border-[#163300]/10 text-[#163300] text-sm font-bold flex items-center gap-3">
                    <CheckCircle size={20} /> {csvResult.created} Records Imported successfully!
                  </div>
                  {csvResult.skipped > 0 && (
                     <div className="p-4 rounded-xl bg-[#fff8e0] border border-[#ffd11a]/20 text-[#8a6d00] text-sm font-bold">
                      {csvResult.skipped} records skipped.
                      {csvResult.errors?.length > 0 && (
                        <ul className="mt-3 space-y-2 font-medium opacity-90 text-xs">
                          {csvResult.errors.slice(0, 5).map((e, i) => <li key={i}>Row {e.row}: {e.error}</li>)}
                        </ul>
                      )}
                    </div>
                  )}
                  <Button variant="primary" fullWidth onClick={() => { setCsvModalOpen(false); setCsvData([]); setCsvResult(null); }}>
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