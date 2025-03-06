// StudentManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Edit, Delete, Visibility, Email, Download, Group } from '@mui/icons-material';
import AdminSidebar from '../components/AdminSidebar';
import './StudentManagementPage.css';

// Mock Data
const mockData = {
  overview: {
    totalStudents: 1200,
    activeStudents: 950,
    inactiveStudents: 250,
    growthTrend: 15,
  },
  students: [
    { id: 1, name: 'Aarav Sharma', email: 'aarav@example.com', phone: '9876543210', course: 'CS101', attendance: 92, status: 'Active', batch: 'Batch A' },
    { id: 2, name: 'Priya Patel', email: 'priya@example.com', phone: '8765432109', course: 'ME201', attendance: 75, status: 'Inactive', batch: 'Batch B' },
    { id: 3, name: 'Rohan Gupta', email: 'rohan@example.com', phone: '7654321098', course: 'EE301', attendance: 88, status: 'Active', batch: 'Batch C' },
  ],
  attendanceData: [
    { name: 'Present', value: 70 },
    { name: 'Absent', value: 20 },
    { name: 'Late', value: 10 },
  ],
  progressData: [
    { month: 'Jan', grade: 75 },
    { month: 'Feb', grade: 80 },
    { month: 'Mar', grade: 85 },
    { month: 'Apr', grade: 82 },
    { month: 'May', grade: 88 },
  ],
  COLORS: ['#10b981', '#f87171', '#fbbf24'],
};

// Animation Variants
const animationVariants = {
  card: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, hover: { scale: 1.05, transition: { duration: 0.3 } } },
  tableRow: { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } },
  modal: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  drawer: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } }
};

// Data Fetching Service
const fetchService = {
  getStudents: async () => mockData.students,
  getOverview: async () => mockData.overview,
  getChartData: async () => ({
    attendanceData: mockData.attendanceData,
    progressData: mockData.progressData,
    colors: mockData.COLORS
  })
};

const StudentManagementPage = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [overview, setOverview] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ batch: '', course: '', attendance: '', status: '' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
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
  const rowsPerPage = 5;

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [studentData, overviewData, chartData] = await Promise.all([
          fetchService.getStudents(),
          fetchService.getOverview(),
          fetchService.getChartData()
        ]);
        setStudents(studentData);
        setFilteredStudents(studentData);
        setOverview(overviewData);
        setChartData(chartData);
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

  const OverviewSection = () => (
    <div className="overview-grid">
      {overview && [
        { title: 'Total Students', value: overview.totalStudents },
        { title: 'Active Students', value: overview.activeStudents },
        { title: 'Inactive Students', value: overview.inactiveStudents },
        { title: 'Growth Trend', value: `${overview.growthTrend}%` }
      ].map((item, index) => (
        <motion.div
          key={index}
          className="overview-card"
          variants={animationVariants.card}
          initial="initial"
          animate="animate"
          whileHover="hover"
        >
          <div className="card-content">
            <Group sx={{ color: '#10b981', fontSize: '2.5rem' }} />
            <div>
              <h3>{item.title}</h3>
              <p className="overview-value">{item.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const FilterSection = () => (
    <div className="filters-section">
      <input
        type="text"
        placeholder="Search Students"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
      {['batch', 'course', 'attendance', 'status'].map((filter) => (
        <select
          key={filter}
          value={filters[filter]}
          onChange={(e) => setFilters({ ...filters, [filter]: e.target.value })}
          className="filter-select"
        >
          <option value="">All {filter.charAt(0).toUpperCase() + filter.slice(1)}s</option>
          {filter === 'batch' && ['Batch A', 'Batch B', 'Batch C'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
          {filter === 'course' && ['CS101', 'ME201', 'EE301'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
          {filter === 'attendance' && ['70', '80', '90'].map(opt => <option key={opt} value={opt}>{`>${opt}%`}</option>)}
          {filter === 'status' && ['Active', 'Inactive'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ))}
    </div>
  );

  const StudentTable = () => (
    <div className="table-container">
      <table className="student-table">
        <thead>
          <tr>
            {['Name', 'Email', 'Phone', 'Course', 'Attendance %', 'Status', 'Actions'].map(header => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan="7">Loading...</td></tr>
          ) : getPaginatedStudents().length > 0 ? (
            getPaginatedStudents().map((student) => (
              <motion.tr
                key={student.id}
                variants={animationVariants.tableRow}
                initial="initial"
                animate="animate"
              >
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.phone}</td>
                <td>{student.course}</td>
                <td>{student.attendance}%</td>
                <td>
                  <span className={`status-chip ${student.status.toLowerCase()}`}>
                    {student.status}
                  </span>
                </td>
                <td className="actions">
                  <button onClick={() => handleViewProfile(student)} className="action-button view">
                    <Visibility />
                  </button>
                  <button onClick={() => handleEdit(student)} className="action-button edit">
                    <Edit />
                  </button>
                  <button onClick={() => handleDelete(student)} className="action-button delete">
                    <Delete />
                  </button>
                </td>
              </motion.tr>
            ))
          ) : (
            <tr><td colSpan="7">No students found</td></tr>
          )}
        </tbody>
      </table>
      {filteredStudents.length > 0 && (
        <div className="pagination">
          {Array(Math.ceil(filteredStudents.length / rowsPerPage)).fill().map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={page === i + 1 ? 'active' : ''}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const ChartsSection = () => (
    chartData && (
      <div className="charts-grid">
        <motion.div className="chart-card" variants={animationVariants.card} initial="initial" animate="animate">
          <h3>Attendance Breakdown</h3>
          <PieChart width={300} height={250}>
            <Pie
              data={chartData.attendanceData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
              label
            >
              {chartData.attendanceData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={chartData.colors[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </motion.div>
        <motion.div className="chart-card" variants={animationVariants.card} initial="initial" animate="animate">
          <h3>Performance Trends</h3>
          <LineChart width={300} height={250} data={chartData.progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="grade" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </motion.div>
      </div>
    )
  );

  return (
    <div className="student-management-container">
      <AdminSidebar />
      <main className="main-content">
        <h1>Student Management</h1>
        <OverviewSection />
        <FilterSection />
        <StudentTable />
        <ChartsSection />
        <div className="bulk-actions">
          <button onClick={() => handleBulkAction('Send Reminder')}>
            <Email sx={{ color: '#fff', marginRight: '0.5rem' }} /> Send Reminder
          </button>
          <button onClick={() => handleBulkAction('Export Data')}>
            <Download sx={{ color: '#fff', marginRight: '0.5rem' }} /> Export Data
          </button>
        </div>

        {editModalOpen && (
          <motion.div className="modal" variants={animationVariants.modal} initial="initial" animate="animate">
            <div className="modal-content modal-scrollable">
              <h2>Edit Student</h2>
              <form className="edit-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Course</label>
                  <select
                    value={editForm.course}
                    onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
                    required
                  >
                    <option value="">Select Course</option>
                    {['CS101', 'ME201', 'EE301'].map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Attendance (%)</label>
                  <input
                    type="number"
                    value={editForm.attendance}
                    onChange={(e) => setEditForm({ ...editForm, attendance: parseInt(e.target.value) })}
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    required
                  >
                    <option value="">Select Status</option>
                    {['Active', 'Inactive'].map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Batch</label>
                  <select
                    value={editForm.batch}
                    onChange={(e) => setEditForm({ ...editForm, batch: e.target.value })}
                    required
                  >
                    <option value="">Select Batch</option>
                    {['Batch A', 'Batch B', 'Batch C'].map(batch => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                </div>
              </form>
              <div className="modal-actions">
                <button onClick={() => setEditModalOpen(false)} className="cancel-button">Cancel</button>
                <button onClick={handleSaveEdit} className="save-button">Save</button>
              </div>
            </div>
          </motion.div>
        )}

        {deleteDialogOpen && (
          <motion.div className="modal" variants={animationVariants.modal} initial="initial" animate="animate">
            <div className="modal-content">
              <h2>Confirm Delete</h2>
              <p>Are you sure you want to delete {selectedStudent?.name}?</p>
              <div className="modal-actions">
                <button onClick={() => setDeleteDialogOpen(false)} className="cancel-button">Cancel</button>
                <button onClick={confirmDelete} className="delete-button">Delete</button>
              </div>
            </div>
          </motion.div>
        )}

        {drawerOpen && (
          <motion.div
            className="drawer"
            variants={animationVariants.drawer}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="drawer-content">
              <h2>{selectedStudent?.name}</h2>
              <p><strong>ID:</strong> {selectedStudent?.id}</p>
              <p><strong>Email:</strong> {selectedStudent?.email}</p>
              <p><strong>Phone:</strong> {selectedStudent?.phone}</p>
              <p><strong>Course:</strong> {selectedStudent?.course}</p>
              <p><strong>Attendance:</strong> {selectedStudent?.attendance}%</p>
              <p><strong>Status:</strong> {selectedStudent?.status}</p>
              <p><strong>Batch:</strong> {selectedStudent?.batch}</p>
              <button onClick={() => setDrawerOpen(false)} className="close-button">Close</button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default StudentManagementPage;