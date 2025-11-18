// StudentManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Eye, Pencil, Trash2, Mail as MailIcon, Download as DownloadIcon, Users as GroupIcon } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

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
const animationVariants = {};

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {overview && [
        { title: 'Total Students', value: overview.totalStudents },
        { title: 'Active Students', value: overview.activeStudents },
        { title: 'Inactive Students', value: overview.inactiveStudents },
        { title: 'Growth Trend', value: `${overview.growthTrend}%` }
      ].map((item, index) => (
        <div key={index} className="border border-bw-37 rounded-lg bg-black text-white p-4 hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3">
            <GroupIcon className="w-8 h-8" />
            <div>
              <h3 className="font-comic text-lg">{item.title}</h3>
              <p className="text-2xl font-comic">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const FilterSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="border border-bw-37 rounded px-3 py-2 flex items-center gap-2">
        <input type="text" placeholder="Search Students" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-black text-white w-full focus:outline-none" />
      </div>
      {['batch', 'course', 'attendance', 'status'].map((filter) => (
        <select
          key={filter}
          value={filters[filter]}
          onChange={(e) => setFilters({ ...filters, [filter]: e.target.value })}
          className="bg-black border border-bw-37 rounded px-3 py-2"
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
    <div className="border border-bw-37 rounded-lg">
      <table className="min-w-full text-left">
        <thead className="bg-bw-12">
          <tr>
            {['Name', 'Email', 'Phone', 'Course', 'Attendance %', 'Status', 'Actions'].map(header => (
              <th key={header} className="px-3 py-2">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td className="px-3 py-2" colSpan="7">Loading...</td></tr>
          ) : getPaginatedStudents().length > 0 ? (
            getPaginatedStudents().map((student) => (
              <tr key={student.id} className="hover:bg-bw-12 transition-colors">
                <td className="px-3 py-2">{student.name}</td>
                <td className="px-3 py-2">{student.email}</td>
                <td className="px-3 py-2">{student.phone}</td>
                <td className="px-3 py-2">{student.course}</td>
                <td className="px-3 py-2">{student.attendance}%</td>
                <td className="px-3 py-2"><span className={`px-2 py-1 border rounded text-sm ${student.status === 'Active' ? 'border-bw-75' : 'border-bw-37'}`}>{student.status}</span></td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleViewProfile(student)} className="border border-bw-37 rounded p-1"><Eye size={16} /></button>
                    <button onClick={() => handleEdit(student)} className="border border-bw-37 rounded p-1"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(student)} className="border border-bw-37 rounded p-1"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr><td className="px-3 py-2" colSpan="7">No students found</td></tr>
          )}
        </tbody>
      </table>
      {filteredStudents.length > 0 && (
        <div className="flex items-center gap-2 p-3">
          {Array(Math.ceil(filteredStudents.length / rowsPerPage)).fill().map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-2 py-1 border rounded ${page === i + 1 ? 'border-bw-75' : 'border-bw-37'}`}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-bw-37 rounded p-4">
          <h3 className="font-comic mb-2">Attendance Breakdown</h3>
          <PieChart width={320} height={250}>
            <Pie data={chartData.attendanceData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label>
              {chartData.attendanceData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={["#DEDEDE","#BFBFBF","#9E9E9E"][index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
        <div className="border border-bw-37 rounded p-4">
          <h3 className="font-comic mb-2">Performance Trends</h3>
          <LineChart width={320} height={250} data={chartData.progressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#616161" />
            <XAxis dataKey="month" stroke="#BFBFBF" />
            <YAxis stroke="#BFBFBF" />
            <Tooltip />
            <Line type="monotone" dataKey="grade" stroke="#DEDEDE" strokeWidth={2} />
          </LineChart>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-black text-white flex">
      <AdminSidebar />
      <main className="flex-1 p-6 space-y-6">
        <h1 className="font-comic text-2xl">Student Management</h1>
        <OverviewSection />
        <FilterSection />
        <StudentTable />
        <ChartsSection />
        <div className="flex items-center gap-2">
          <button onClick={() => handleBulkAction('Send Reminder')} className="border border-bw-37 rounded px-3 py-2 flex items-center gap-2">
            <MailIcon size={16} /> Send Reminder
          </button>
          <button onClick={() => handleBulkAction('Export Data')} className="border border-bw-37 rounded px-3 py-2 flex items-center gap-2">
            <DownloadIcon size={16} /> Export Data
          </button>
        </div>

        {editModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="border border-bw-37 bg-black text-white rounded-lg p-6 w-full max-w-xl">
              <h2>Edit Student</h2>
              <form className="space-y-3">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none focus:border-bw-75" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none focus:border-bw-75" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    required className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none focus:border-bw-75" />
                </div>
                <div className="form-group">
                  <label>Course</label>
                  <select
                    value={editForm.course}
                    onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
                    required className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none focus:border-bw-75">
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
                    required className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none focus:border-bw-75" />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    required className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none focus:border-bw-75">
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
                    required className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none focus:border-bw-75">
                    <option value="">Select Batch</option>
                    {['Batch A', 'Batch B', 'Batch C'].map(batch => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                </div>
              </form>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setEditModalOpen(false)} className="border border-bw-37 rounded px-3 py-2">Cancel</button>
                <button onClick={handleSaveEdit} className="border border-bw-37 rounded px-3 py-2">Save</button>
              </div>
            </div>
          </div>
        )}

        {deleteDialogOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="border border-bw-37 bg-black text-white rounded-lg p-6 w-full max-w-md">
              <h2>Confirm Delete</h2>
              <p>Are you sure you want to delete {selectedStudent?.name}?</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeleteDialogOpen(false)} className="border border-bw-37 rounded px-3 py-2">Cancel</button>
                <button onClick={confirmDelete} className="border border-bw-37 rounded px-3 py-2">Delete</button>
              </div>
            </div>
          </div>
        )}

        {drawerOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-end justify-center">
            <div className="border-t border-bw-37 bg-black text-white w-full max-w-2xl p-6 rounded-t-lg">
              <h2 className="font-comic text-xl mb-2">{selectedStudent?.name}</h2>
              <p><strong>ID:</strong> {selectedStudent?.id}</p>
              <p><strong>Email:</strong> {selectedStudent?.email}</p>
              <p><strong>Phone:</strong> {selectedStudent?.phone}</p>
              <p><strong>Course:</strong> {selectedStudent?.course}</p>
              <p><strong>Attendance:</strong> {selectedStudent?.attendance}%</p>
              <p><strong>Status:</strong> {selectedStudent?.status}</p>
              <p><strong>Batch:</strong> {selectedStudent?.batch}</p>
              <button onClick={() => setDrawerOpen(false)} className="mt-3 border border-bw-37 rounded px-3 py-2">Close</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentManagementPage;