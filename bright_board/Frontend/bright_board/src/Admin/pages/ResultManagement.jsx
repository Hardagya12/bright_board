// ResultManagement.jsx
import React, { useState, useRef } from 'react';
import './ResultManagement.css';
import CountUp from 'react-countup';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Modal,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  Grid,
  Tooltip,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Search,
  FilterList,
  Download,
  Edit,
  Visibility,
  Close,
  CloudUpload,
  Print,
  Save,
  Delete,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';

// Mock Data with Indian Names and Consistent Avatar
const mockStudents = [
  { id: 'STU001', name: 'Aarav Sharma', batch: 'Batch A', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
  { id: 'STU002', name: 'Priya Patel', batch: 'Batch B', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
  { id: 'STU003', name: 'Rahul Gupta', batch: 'Batch C', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
  { id: 'STU004', name: 'Neha Singh', batch: 'Batch A', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
  { id: 'STU005', name: 'Vikram Jain', batch: 'Batch B', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
];

const mockSubjects = [
  { id: 'SUB001', name: 'Mathematics' },
  { id: 'SUB002', name: 'Science' },
  { id: 'SUB003', name: 'English' },
  { id: 'SUB004', name: 'History' },
  { id: 'SUB005', name: 'Computer Science' },
];

const mockExams = [
  { id: 'EX001', name: 'Midterm Examination' },
  { id: 'EX002', name: 'Final Examination' },
  { id: 'EX003', name: 'Quiz 1' },
  { id: 'EX004', name: 'Quiz 2' },
];

const batches = ['All', 'Batch A', 'Batch B', 'Batch C'];

const generateMockResults = () => {
  const results = [];
  for (let i = 0; i < 100; i++) {
    const student = mockStudents[Math.floor(Math.random() * mockStudents.length)];
    const subject = mockSubjects[Math.floor(Math.random() * mockSubjects.length)];
    const exam = mockExams[Math.floor(Math.random() * mockExams.length)];
    const totalMarks = 100;
    const marksObtained = Math.floor(Math.random() * 101);
    const percentage = (marksObtained / totalMarks) * 100;
    const status = percentage >= 40 ? 'Pass' : 'Fail';

    results.push({
      id: `RES${i.toString().padStart(3, '0')}`,
      studentId: student.id,
      studentName: student.name,
      studentAvatar: student.avatar,
      batch: student.batch,
      subjectId: subject.id,
      subjectName: subject.name,
      examId: exam.id,
      examName: exam.name,
      totalMarks,
      marksObtained,
      percentage,
      status,
      grade: percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : percentage >= 40 ? 'E' : 'F',
      remarks: percentage >= 40 ? 'Satisfactory' : 'Needs Improvement',
      date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    });
  }
  return results;
};

let initialResults = generateMockResults();

const mockPerformanceData = [
  { name: 'Batch A', Mathematics: 78, Science: 82, English: 75, History: 68, ComputerScience: 85 },
  { name: 'Batch B', Mathematics: 72, Science: 78, English: 80, History: 74, ComputerScience: 79 },
  { name: 'Batch C', Mathematics: 85, Science: 76, English: 72, History: 81, ComputerScience: 88 },
];

const mockTrendData = [
  { month: 'Jan', average: 72 },
  { month: 'Feb', average: 75 },
  { month: 'Mar', average: 78 },
  { month: 'Apr', average: 74 },
  { month: 'May', average: 80 },
  { month: 'Jun', average: 82 },
];

const mockDistributionData = [
  { name: 'A+', value: 15 },
  { name: 'A', value: 20 },
  { name: 'B', value: 25 },
  { name: 'C', value: 18 },
  { name: 'D', value: 12 },
  { name: 'E', value: 6 },
  { name: 'F', value: 4 },
];

const COLORS = ['#4cd964', '#5ac8fa', '#007aff', '#ffcc00', '#ff9500', '#ff3b30', '#8e8e93'];

const ResultManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [results, setResults] = useState(initialResults);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const filteredByBatch = selectedBatch === 'All' ? results : results.filter(result => result.batch === selectedBatch);
  const totalExams = [...new Set(filteredByBatch.map(result => result.examId))].length;
  const passPercentage = Math.round((filteredByBatch.filter(result => result.status === 'Pass').length / filteredByBatch.length) * 100) || 0;
  const topStudent = filteredByBatch.reduce((prev, current) => prev.percentage > current.percentage ? prev : current, filteredByBatch[0]);

  const handleSearch = (event) => setSearchTerm(event.target.value);
  const handleExamChange = (event) => setSelectedExam(event.target.value);
  const handleSubjectChange = (event) => setSelectedSubject(event.target.value);
  const handleBatchChange = (event) => setSelectedBatch(event.target.value);

  const handleViewResult = (result) => {
    setSelectedResult(result);
    setModalOpen(true);
  };

  const handleEditResult = (result) => {
    setSelectedResult(result);
    setEditForm({
      marksObtained: result.marksObtained,
      totalMarks: result.totalMarks,
      grade: result.grade,
      status: result.status,
      remarks: result.remarks,
    });
    setEditModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditForm({});
  };

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const handleSaveEdit = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const updatedResult = {
      ...selectedResult,
      ...editForm,
      percentage: (editForm.marksObtained / editForm.totalMarks) * 100,
    };
    setResults(results.map(r => r.id === updatedResult.id ? updatedResult : r));
    setSnackbar({ open: true, message: 'Result updated successfully!', severity: 'success' });
    setEditModalOpen(false);
    setLoading(false);
  };

  const handleDeleteResult = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setResults(results.filter(r => r.id !== selectedResult.id));
    setSnackbar({ open: true, message: 'Result deleted successfully!', severity: 'success' });
    setEditModalOpen(false);
    setLoading(false);
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      setTimeout(() => {
        setSnackbar({ open: true, message: 'Results uploaded successfully!', severity: 'success' });
        setLoading(false);
      }, 1500);
    }
  };

  const handleExport = () => {
    const csvContent = [
      'Student ID,Student Name,Batch,Exam,Subject,Marks Obtained,Total Marks,Percentage,Grade,Status,Remarks,Date',
      ...filteredResults.map(r => 
        `${r.studentId},${r.studentName},${r.batch},${r.examName},${r.subjectName},${r.marksObtained},${r.totalMarks},${r.percentage.toFixed(2)},${r.grade},${r.status},${r.remarks},${r.date}`
      )
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `results_${selectedBatch}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const filteredResults = filteredByBatch.filter(result => (
    (searchTerm === '' || 
     result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     result.studentId.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedExam === '' || result.examId === selectedExam) &&
    (selectedSubject === '' || result.subjectId === selectedSubject)
  ));

  const columns = [
    { 
      field: 'studentId', 
      headerName: 'Student ID', 
      flex: 1,
      minWidth: 120,
      sortable: false, 
      filterable: false,
      disableColumnMenu: true 
    },
    {
      field: 'studentName',
      headerName: 'Student Name',
      flex: 1,
      minWidth: 180,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <div className="adminresult-student-info">
          <img src={params.row.studentAvatar} alt={params.row.studentName} className="adminresult-student-avatar" />
          <div>{params.row.studentName}</div>
        </div>
      ),
    },
    { 
      field: 'batch', 
      headerName: 'Batch', 
      flex: 1,
      minWidth: 120,
      sortable: false, 
      filterable: false,
      disableColumnMenu: true 
    },
    { 
      field: 'examName', 
      headerName: 'Exam', 
      flex: 1,
      minWidth: 180,
      sortable: false, 
      filterable: false,
      disableColumnMenu: true 
    },
    { 
      field: 'subjectName', 
      headerName: 'Subject', 
      flex: 1,
      minWidth: 150,
      sortable: false, 
      filterable: false,
      disableColumnMenu: true 
    },
    {
      field: 'marks',
      headerName: 'Marks',
      flex: 1,
      minWidth: 120,
      sortable: true,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <div>{params.row.marksObtained} / {params.row.totalMarks}</div>
      ),
    },
    {
      field: 'percentage',
      headerName: 'Percentage',
      flex: 1,
      minWidth: 120,
      sortable: true,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <div>{params.row.percentage.toFixed(2)}%</div>
      ),
    },
    { 
      field: 'grade', 
      headerName: 'Grade', 
      flex: 1,
      minWidth: 100,
      sortable: true, 
      filterable: false,
      disableColumnMenu: true 
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <div className={`adminresult-status-badge adminresult-status-${params.row.status.toLowerCase()}`}>
          {params.row.status}
        </div>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 150,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <div>
          <Tooltip title="View Result">
            <IconButton className="adminresult-action-button" onClick={() => handleViewResult(params.row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Result">
            <IconButton className="adminresult-action-button" onClick={() => handleEditResult(params.row)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download Report">
            <IconButton className="adminresult-action-button" onClick={handleExport}>
              <Download fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="adminresult-wrapper">
      <AdminSidebar />
      <div className="adminresult-main-content">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Typography className="adminresult-page-title">Result Management</Typography>
          <FormControl className="adminresult-batch-select">
            <InputLabel>Select Batch</InputLabel>
            <Select value={selectedBatch} onChange={handleBatchChange}>
              {batches.map(batch => (
                <MenuItem key={batch} value={batch}>{batch}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </motion.div>

        <motion.div className="adminresult-search-filter-container" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
            <TextField
              label="Search Student"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{ startAdornment: <Search className="adminresult-search-icon" /> }}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FormControl className="adminresult-filter-select">
              <InputLabel>Filter by Exam</InputLabel>
              <Select value={selectedExam} onChange={handleExamChange}>
                <MenuItem value="">All Exams</MenuItem>
                {mockExams.map(exam => <MenuItem key={exam.id} value={exam.id}>{exam.name}</MenuItem>)}
              </Select>
            </FormControl>
          </motion.div>
          <motion.div variants={itemVariants}>
            <FormControl className="adminresult-filter-select">
              <InputLabel>Filter by Subject</InputLabel>
              <Select value={selectedSubject} onChange={handleSubjectChange}>
                <MenuItem value="">All Subjects</MenuItem>
                {mockSubjects.map(subject => <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>)}
              </Select>
            </FormControl>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <div className="adminresult-table-container">
            <div className="adminresult-table-header">
              <div className="adminresult-table-title">Student Results</div>
              <Button variant="contained" startIcon={<Download />} onClick={handleExport}>
                Export Results
              </Button>
            </div>
            <div className="adminresult-data-grid-container">
              <DataGrid
                rows={filteredResults}
                columns={columns}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                pageSizeOptions={[5, 10, 25]}
                disableRowSelectionOnClick
                disableColumnMenu
                sx={{
                  '& .MuiDataGrid-root': {
                    width: '100%',
                  },
                  '& .MuiDataGrid-main': {
                    overflowX: 'auto',
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    overflowY: 'auto !important',
                    maxHeight: '400px',
                  },
                }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <Typography className="adminresult-section-title">Result Analytics</Typography>
          <div className="adminresult-analytics-container">
            <motion.div className="adminresult-chart-container" variants={itemVariants}>
              <div className="adminresult-chart-title">Performance Comparison</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="Mathematics" fill="#ff4d4d" />
                  <Bar dataKey="Science" fill="#f9cb28" />
                  <Bar dataKey="English" fill="#4cd964" />
                  <Bar dataKey="History" fill="#5ac8fa" />
                  <Bar dataKey="ComputerScience" fill="#007aff" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
            <motion.div className="adminresult-chart-container" variants={itemVariants}>
              <div className="adminresult-chart-title">Performance Trend</div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="average" stroke="#5ac8fa" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </motion.div>

        <motion.div className="adminresult-grid-container" variants={containerVariants} initial="hidden" animate="visible">
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <motion.div className="adminresult-leaderboard-container" variants={itemVariants}>
                <div className="adminresult-leaderboard-title">Top Performing Students</div>
                <table className="adminresult-leaderboard-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Student</th>
                      <th>Batch</th>
                      <th>Subject</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredByBatch.sort((a, b) => b.percentage - a.percentage).slice(0, 5).map((result, index) => (
                      <tr key={result.id}>
                        <td className={`adminresult-leaderboard-rank adminresult-rank-${index + 1}`}>{index + 1}</td>
                        <td>
                          <div className="adminresult-student-info">
                            <img src={result.studentAvatar} alt={result.studentName} className="adminresult-student-avatar" />
                            <div>
                              <div className="adminresult-student-name">{result.studentName}</div>
                              <div className="adminresult-student-id">{result.studentId}</div>
                            </div>
                          </div>
                        </td>
                        <td>{result.batch}</td>
                        <td>{result.subjectName}</td>
                        <td className="adminresult-student-score">{result.percentage.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={4}>
              <motion.div className="adminresult-chart-container" variants={itemVariants}>
                <div className="adminresult-chart-title">Grade Distribution</div>
                <div className="adminresult-pie-chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius, index }) => {
                          const radius = outerRadius + 20;
                          const RADIAN = Math.PI / 180;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return (
                            <text
                              x={x}
                              y={y}
                              fill={COLORS[index % COLORS.length]}
                              textAnchor={x > cx ? 'start' : 'end'}
                              dominantBaseline="central"
                              fontSize={12}
                            >
                              {`${name}: ${(percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                      >
                        {mockDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <div className="adminresult-upload-section">
            <div className="adminresult-upload-title">Bulk Result Upload</div>
            <div className="adminresult-upload-dropzone" onClick={() => fileInputRef.current.click()}>
              {loading ? <CircularProgress /> : (
                <>
                  <CloudUpload className="adminresult-upload-icon" />
                  <div className="adminresult-upload-text">Drag & Drop CSV file here or click to browse</div>
                  <div className="adminresult-upload-subtext">Supported format: CSV with columns for Student ID, Subject, Marks, etc.</div>
                </>
              )}
              <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleUpload} />
            </div>
          </div>
        </motion.div>

        {/* View Result Modal */}
        <Modal open={modalOpen} onClose={handleCloseModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <motion.div
              className="adminresult-modal-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="adminresult-modal-header">
                <div className="adminresult-modal-title">Student Result Details</div>
                <IconButton className="adminresult-close-button" onClick={handleCloseModal}>
                  <Close />
                </IconButton>
              </div>
              {selectedResult && (
                <>
                  <div className="adminresult-student-profile">
                    <img src={selectedResult.studentAvatar} alt={selectedResult.studentName} className="adminresult-profile-avatar" />
                    <div className="adminresult-profile-info">
                      <div className="adminresult-profile-name">{selectedResult.studentName}</div>
                      <div className="adminresult-profile-details">
                        <div className="adminresult-profile-detail">ID: {selectedResult.studentId}</div>
                        <div className="adminresult-profile-detail">Batch: {selectedResult.batch}</div>
                        <div className="adminresult-profile-detail">Exam: {selectedResult.examName}</div>
                        <div className="adminresult-profile-detail">Date: {selectedResult.date}</div>
                      </div>
                    </div>
                  </div>
                  <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Result Summary" />
                    <Tab label="Performance Analysis" />
                  </Tabs>
                  {tabValue === 0 && (
                    <div className="adminresult-subject-scores">
                      <div className="adminresult-subject-score-item">
                        <div className="adminresult-subject-name">{selectedResult.subjectName}</div>
                        <div className="adminresult-subject-marks">
                          <span className="adminresult-marks-value">{selectedResult.marksObtained}</span>
                          <span className="adminresult-marks-total">/ {selectedResult.totalMarks}</span>
                          <span className={`adminresult-marks-percentage ${selectedResult.percentage < 40 ? 'adminresult-low' : ''}`}>
                            {selectedResult.percentage.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <div className="adminresult-subject-score-item">
                        <div className="adminresult-subject-name">Grade</div>
                        <div className="adminresult-subject-marks">
                          <span className="adminresult-marks-value">{selectedResult.grade}</span>
                        </div>
                      </div>
                      <div className="adminresult-subject-score-item">
                        <div className="adminresult-subject-name">Status</div>
                        <div className="adminresult-subject-marks">
                          <span className={`adminresult-status-badge adminresult-status-${selectedResult.status.toLowerCase()}`}>
                            {selectedResult.status}
                          </span>
                        </div>
                      </div>
                      <div className="adminresult-subject-score-item">
                        <div className="adminresult-subject-name">Remarks</div>
                        <div className="adminresult-subject-marks">
                          <span className="adminresult-marks-value">{selectedResult.remarks}</span>
                        </div>
                      </div>
                      <div className="adminresult-modal-actions">
                        <Button variant="outlined" startIcon={<Print />}>Print Report Card</Button>
                        <Button variant="contained" startIcon={<Download />}>Download PDF</Button>
                      </div>
                    </div>
                  )}
                  {tabValue === 1 && (
                    <div className="adminresult-performance-analysis">
                      <Typography className="adminresult-performance-subtitle">Performance Comparison with Class Average</Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={[{ name: selectedResult.subjectName, Student: selectedResult.percentage, ClassAverage: 72 }]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="Student" fill="#a5b4fc" />
                          <Bar dataKey="ClassAverage" fill="rgba(255, 255, 255, 0.3)" />
                        </BarChart>
                      </ResponsiveContainer>
                      <Typography className="adminresult-performance-subtitle">Performance History</Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={[
                          { month: 'Jan', score: 65 },
                          { month: 'Feb', score: 70 },
                          { month: 'Mar', score: 68 },
                          { month: 'Apr', score: 75 },
                          { month: 'May', score: selectedResult.percentage },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="score" stroke="#a5b4fc" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </Box>
        </Modal>

        {/* Edit Result Modal */}
        <Modal open={editModalOpen} onClose={handleCloseEditModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <motion.div
              className="adminresult-modal-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="adminresult-modal-header">
                <div className="adminresult-modal-title">Edit Student Result</div>
                <IconButton className="adminresult-close-button" onClick={handleCloseEditModal}>
                  <Close />
                </IconButton>
              </div>
              {selectedResult && (
                <>
                  <div className="adminresult-student-profile">
                    <img src={selectedResult.studentAvatar} alt={selectedResult.studentName} className="adminresult-profile-avatar" />
                    <div className="adminresult-profile-info">
                      <div className="adminresult-profile-name">{selectedResult.studentName}</div>
                      <div className="adminresult-profile-details">
                        <div className="adminresult-profile-detail">ID: {selectedResult.studentId}</div>
                        <div className="adminresult-profile-detail">Batch: {selectedResult.batch}</div>
                        <div className="adminresult-profile-detail">Exam: {selectedResult.examName}</div>
                        <div className="adminresult-profile-detail">Subject: {selectedResult.subjectName}</div>
                      </div>
                    </div>
                  </div>
                  {loading ? (
                    <Box className="adminresult-loading-container">
                      <CircularProgress />
                    </Box>
                  ) : (
                    <div className="adminresult-edit-form-container">
                      <div className="adminresult-form-row">
                        <TextField
                          label="Marks Obtained"
                          type="number"
                          value={editForm.marksObtained || ''}
                          onChange={(e) => setEditForm({ ...editForm, marksObtained: parseInt(e.target.value) })}
                          className="adminresult-form-field"
                          InputProps={{ inputProps: { min: 0, max: editForm.totalMarks } }}
                        />
                        <TextField
                          label="Total Marks"
                          type="number"
                          value={editForm.totalMarks || ''}
                          onChange={(e) => setEditForm({ ...editForm, totalMarks: parseInt(e.target.value) })}
                          className="adminresult-form-field"
                          InputProps={{ inputProps: { min: 1 } }}
                        />
                      </div>
                      <div className="adminresult-form-row">
                        <FormControl className="adminresult-form-field">
                          <InputLabel>Grade</InputLabel>
                          <Select
                            value={editForm.grade || ''}
                            onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                          >
                            {['A+', 'A', 'B', 'C', 'D', 'E', 'F'].map(grade => (
                              <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl className="adminresult-form-field">
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={editForm.status || ''}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          >
                            <MenuItem value="Pass">Pass</MenuItem>
                            <MenuItem value="Fail">Fail</MenuItem>
                          </Select>
                        </FormControl>
                      </div>
                      <TextField
                        label="Remarks"
                        multiline
                        rows={3}
                        value={editForm.remarks || ''}
                        onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                        className="adminresult-form-field adminresult-full-width"
                      />
                      <div className="adminresult-modal-actions">
                        <Button variant="outlined" startIcon={<Delete />} onClick={handleDeleteResult}>
                          Delete Result
                        </Button>
                        <Button variant="contained" startIcon={<Save />} onClick={handleSaveEdit}>
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </Box>
        </Modal>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default ResultManagement;