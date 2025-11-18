// ResultManagement.jsx
import { useState, useRef } from 'react';
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
import { Eye, Pencil, Download as DownloadIcon, Search as SearchIcon, X, CloudUpload as CloudUploadIcon, Printer, Save as SaveIcon, Trash2 } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import * as FM from 'framer-motion';
const motion = FM.motion || { div: 'div', span: 'span' };
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Modal,
  Box,
  Tabs,
  Tab,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import Download from '@mui/icons-material/Download';
import Close from '@mui/icons-material/Close';
import Print from '@mui/icons-material/Print';
import Visibility from '@mui/icons-material/Visibility';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Save from '@mui/icons-material/Save';
import CloudUpload from '@mui/icons-material/CloudUpload';
import Search from '@mui/icons-material/Search';
import { DataGrid } from '@mui/x-data-grid';

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

const COLORS = ['#DEDEDE', '#BFBFBF', '#9E9E9E', '#808080', '#616161', '#404040', '#1F1F1F'];

const ResultManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [banner, setBanner] = useState({ open: false, message: '', type: 'success' });
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
    setBanner({ open: true, message: 'Result updated successfully!', type: 'success' });
    setEditModalOpen(false);
    setLoading(false);
  };

  const handleDeleteResult = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setResults(results.filter(r => r.id !== selectedResult.id));
    setBanner({ open: true, message: 'Result deleted successfully!', type: 'success' });
    setEditModalOpen(false);
    setLoading(false);
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      setTimeout(() => {
        setBanner({ open: true, message: 'Results uploaded successfully!', type: 'success' });
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

  const handleCloseBanner = () => setBanner({ ...banner, open: false });

  const filteredResults = filteredByBatch.filter(result => (
    (searchTerm === '' || 
     result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     result.studentId.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedExam === '' || result.examId === selectedExam) &&
    (selectedSubject === '' || result.subjectId === selectedSubject)
  ));

  const tableHeaders = ['Student ID','Student Name','Batch','Exam','Subject','Marks','Percentage','Grade','Status','Actions'];

  

  return (
    <div className="min-h-screen bg-black text-white flex">
      <AdminSidebar />
      <div className="flex-1 p-6 space-y-6">
        <h1 className="font-comic text-2xl">Result Management</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-bw-75">Select Batch</label>
          <select value={selectedBatch} onChange={handleBatchChange} className="bg-black border border-bw-37 rounded px-3 py-2">
            {batches.map(batch => (
              <option key={batch} value={batch}>{batch}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-bw-37 rounded-lg bg-black text-white p-4">
            <label className="block text-sm text-bw-75 mb-1">Search Student</label>
            <div className="flex items-center gap-2 border border-bw-37 rounded px-3 py-2">
              <SearchIcon size={16} className="text-bw-62" />
              <input value={searchTerm} onChange={handleSearch} placeholder="Name or ID" className="bg-black text-white w-full focus:outline-none" />
            </div>
          </div>
          <div className="border border-bw-37 rounded-lg bg-black text-white p-4">
            <label className="block text-sm text-bw-75 mb-1">Filter by Exam</label>
            <select value={selectedExam} onChange={handleExamChange} className="bg-black border border-bw-37 rounded px-3 py-2 w-full">
              <option value="">All Exams</option>
              {mockExams.map(exam => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
            </select>
          </div>
          <div className="border border-bw-37 rounded-lg bg-black text-white p-4">
            <label className="block text-sm text-bw-75 mb-1">Filter by Subject</label>
            <select value={selectedSubject} onChange={handleSubjectChange} className="bg-black border border-bw-37 rounded px-3 py-2 w-full">
              <option value="">All Subjects</option>
              {mockSubjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
          </div>
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-comic text-lg">Student Results</div>
            <Button onClick={handleExport}><DownloadIcon size={16} className="mr-2" />Export Results</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border border-bw-37 rounded">
              <thead className="bg-bw-12">
                <tr>
                  {tableHeaders.map((h) => (<th key={h} className="px-3 py-2">{h}</th>))}
                </tr>
              </thead>
              <tbody>
                {filteredResults.slice(0, 25).map((row) => (
                  <tr key={row.id} className="hover:bg-bw-12 transition-colors">
                    <td className="px-3 py-2">{row.studentId}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <img src={row.studentAvatar} alt={row.studentName} className="w-8 h-8 rounded-full" />
                        <span>{row.studentName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">{row.batch}</td>
                    <td className="px-3 py-2">{row.examName}</td>
                    <td className="px-3 py-2">{row.subjectName}</td>
                    <td className="px-3 py-2">{row.marksObtained} / {row.totalMarks}</td>
                    <td className="px-3 py-2">{row.percentage.toFixed(2)}%</td>
                    <td className="px-3 py-2">{row.grade}</td>
                    <td className="px-3 py-2"><span className={`px-2 py-1 border rounded text-sm ${row.status === 'Pass' ? 'border-bw-75' : 'border-bw-37'}`}>{row.status}</span></td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => handleViewResult(row)}><Eye size={16} /></Button>
                        <Button variant="ghost" onClick={() => handleEditResult(row)}><Pencil size={16} /></Button>
                        <Button variant="ghost" onClick={handleExport}><DownloadIcon size={16} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-comic text-lg mb-3">Result Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="font-comic mb-2">Performance Comparison</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#616161" />
                  <XAxis dataKey="name" stroke="#BFBFBF" />
                  <YAxis stroke="#BFBFBF" />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="Mathematics" fill="#DEDEDE" />
                  <Bar dataKey="Science" fill="#BFBFBF" />
                  <Bar dataKey="English" fill="#9E9E9E" />
                  <Bar dataKey="History" fill="#808080" />
                  <Bar dataKey="ComputerScience" fill="#616161" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-4">
              <div className="font-comic mb-2">Performance Trend</div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#616161" />
                  <XAxis dataKey="month" stroke="#BFBFBF" />
                  <YAxis stroke="#BFBFBF" />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="average" stroke="#DEDEDE" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 md:col-span-2">
            <div className="font-comic mb-2">Top Performing Students</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border border-bw-37 rounded">
                <thead className="bg-bw-12">
                  <tr>
                    {['Rank','Student','Batch','Subject','Score'].map(h => <th key={h} className="px-3 py-2">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredByBatch.sort((a, b) => b.percentage - a.percentage).slice(0, 5).map((result, index) => (
                    <tr key={result.id} className="hover:bg-bw-12 transition-colors">
                      <td className="px-3 py-2">{index + 1}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <img src={result.studentAvatar} alt={result.studentName} className="w-8 h-8 rounded-full" />
                          <div>
                            <div>{result.studentName}</div>
                            <div className="text-bw-75 text-xs">{result.studentId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">{result.batch}</td>
                      <td className="px-3 py-2">{result.subjectName}</td>
                      <td className="px-3 py-2">{result.percentage.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card className="p-4">
            <div className="font-comic mb-2">Grade Distribution</div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={mockDistributionData} cx="50%" cy="50%" labelLine outerRadius={80} dataKey="value">
                  {mockDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="p-4">
          <div className="font-comic mb-2">Bulk Result Upload</div>
          <div className="border border-bw-37 rounded p-6 text-center cursor-pointer" onClick={() => fileInputRef.current.click()}>
            {loading ? <Skeleton height="2rem" /> : (
              <>
                <CloudUploadIcon className="mx-auto" />
                <div className="mt-2">Drag & Drop CSV file here or click to browse</div>
                <div className="text-bw-75 text-sm">Supported format: CSV with columns for Student ID, Subject, Marks, etc.</div>
              </>
            )}
            <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleUpload} />
          </div>
        </Card>

        {modalOpen && selectedResult && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="border border-bw-37 bg-black text-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="font-comic text-lg">Student Result Details</div>
                <button className="border border-bw-37 rounded p-1" onClick={handleCloseModal}><X /></button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <img src={selectedResult.studentAvatar} alt={selectedResult.studentName} className="w-16 h-16 rounded-full" />
                <div>
                  <div className="font-comic">{selectedResult.studentName}</div>
                  <div className="text-bw-75 text-sm">ID: {selectedResult.studentId} • Batch: {selectedResult.batch} • Exam: {selectedResult.examName} • Date: {selectedResult.date}</div>
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                <Button variant={tabValue === 0 ? 'primary' : 'outline'} onClick={(e) => setTabValue(0)}>Result Summary</Button>
                <Button variant={tabValue === 1 ? 'primary' : 'outline'} onClick={(e) => setTabValue(1)}>Performance Analysis</Button>
              </div>
              {tabValue === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="font-comic mb-2">{selectedResult.subjectName}</div>
                    <div className="text-3xl font-comic">{selectedResult.marksObtained} <span className="text-bw-75 text-xl">/ {selectedResult.totalMarks}</span></div>
                    <div className="mt-2 text-bw-75">{selectedResult.percentage.toFixed(2)}%</div>
                  </Card>
                  <Card className="p-4">
                    <div className="font-comic mb-2">Grade</div>
                    <div className="text-2xl">{selectedResult.grade}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="font-comic mb-2">Status</div>
                    <div><span className={`px-2 py-1 border rounded ${selectedResult.status === 'Pass' ? 'border-bw-75' : 'border-bw-37'}`}>{selectedResult.status}</span></div>
                  </Card>
                  <Card className="p-4">
                    <div className="font-comic mb-2">Remarks</div>
                    <div>{selectedResult.remarks}</div>
                  </Card>
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <Button variant="outline"><Printer size={16} className="mr-2" />Print Report Card</Button>
                    <Button><DownloadIcon size={16} className="mr-2" />Download PDF</Button>
                  </div>
                </div>
              )}
              {tabValue === 1 && (
                <div className="space-y-4">
                  <div>
                    <div className="font-comic mb-2">Performance Comparison with Class Average</div>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={[{ name: selectedResult.subjectName, Student: selectedResult.percentage, ClassAverage: 72 }]}> 
                        <CartesianGrid strokeDasharray="3 3" stroke="#616161" />
                        <XAxis dataKey="name" stroke="#BFBFBF" />
                        <YAxis stroke="#BFBFBF" />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="Student" fill="#DEDEDE" />
                        <Bar dataKey="ClassAverage" fill="#9E9E9E" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <div className="font-comic mb-2">Performance History</div>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={[
                        { month: 'Jan', score: 65 },
                        { month: 'Feb', score: 70 },
                        { month: 'Mar', score: 68 },
                        { month: 'Apr', score: 75 },
                        { month: 'May', score: selectedResult.percentage },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#616161" />
                        <XAxis dataKey="month" stroke="#BFBFBF" />
                        <YAxis stroke="#BFBFBF" />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="score" stroke="#DEDEDE" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {editModalOpen && selectedResult && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="border border-bw-37 bg-black text-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="font-comic text-lg">Edit Student Result</div>
                <button className="border border-bw-37 rounded p-1" onClick={handleCloseEditModal}><X /></button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <img src={selectedResult.studentAvatar} alt={selectedResult.studentName} className="w-16 h-16 rounded-full" />
                <div>
                  <div className="font-comic">{selectedResult.studentName}</div>
                  <div className="text-bw-75 text-sm">ID: {selectedResult.studentId} • Batch: {selectedResult.batch} • Exam: {selectedResult.examName} • Subject: {selectedResult.subjectName}</div>
                </div>
              </div>
              {loading ? (
                <div className="py-8"><Skeleton height="2rem" /></div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-bw-75 mb-1">Marks Obtained</label>
                      <input type="number" value={editForm.marksObtained || ''} onChange={(e) => setEditForm({ ...editForm, marksObtained: parseInt(e.target.value) })} className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none focus:border-bw-75" />
                    </div>
                    <div>
                      <label className="block text-sm text-bw-75 mb-1">Total Marks</label>
                      <input type="number" value={editForm.totalMarks || ''} onChange={(e) => setEditForm({ ...editForm, totalMarks: parseInt(e.target.value) })} className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none focus:border-bw-75" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-bw-75 mb-1">Grade</label>
                      <select value={editForm.grade || ''} onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })} className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none focus:border-bw-75">
                        {['A+', 'A', 'B', 'C', 'D', 'E', 'F'].map(grade => (<option key={grade} value={grade}>{grade}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-bw-75 mb-1">Status</label>
                      <select value={editForm.status || ''} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none focus:border-bw-75">
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-bw-75 mb-1">Remarks</label>
                    <textarea rows={3} value={editForm.remarks || ''} onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })} className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none focus:border-bw-75" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleDeleteResult}><Trash2 size={16} className="mr-2" />Delete Result</Button>
                    <Button onClick={handleSaveEdit}><SaveIcon size={16} className="mr-2" />Save Changes</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {banner.open && (
          <div className={`border rounded p-3 ${banner.type === 'success' ? 'border-bw-75' : 'border-bw-37'}`}>{banner.message}</div>
        )}
      </div>
    </div>
  );
};

export default ResultManagement;
