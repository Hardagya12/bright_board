import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Eye, Pencil, Download, Search, X, Upload, Printer, Save, Trash2, ChevronDown, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { listTutorResults, getResultsAnalytics, getAnswerReview } from '../../utils/services/results';
import { listBatches } from '../../utils/services/batches';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

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
  const [results, setResults] = useState([]);
  const [editForm, setEditForm] = useState({});
  const [answerModal, setAnswerModal] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [analytics, setAnalytics] = useState({ performance: [], trend: [], distribution: [] });
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [batches, setBatches] = useState(['All']);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await listTutorResults();
        const rs = (data.results || []).map(r => ({
          ...r,
          studentAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(r.studentName)}&background=random`,
          subjectId: r.subjectName || '',
        }));
        setResults(rs);
        const subjectsSet = Array.from(new Set(rs.map(r => r.subjectName).filter(Boolean)));
        setSubjects(subjectsSet.map((s, i) => ({ id: s || `SUB${i}`, name: s || 'Unknown' })));
        const examsSet = Array.from(new Set(rs.map(r => r.examId)));
        setExams(examsSet.map(e => ({ id: e, name: rs.find(r => r.examId === e)?.examName || 'Exam' })));
        try {
          const { data: b } = await listBatches({ limit: 100 });
          const bb = (b.batches || []).map(x => x.batchId);
          setBatches(['All', ...bb]);
        } catch { }
        const { data: an } = await getResultsAnalytics();
        setAnalytics(an);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredByBatch = selectedBatch === 'All' ? results : results.filter(result => result.batch === selectedBatch);

  const filteredResults = filteredByBatch.filter(result => (
    (searchTerm === '' ||
      result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.studentId.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedExam === '' || result.examId === selectedExam) &&
    (selectedSubject === '' || result.subjectId === selectedSubject)
  ));

  const handleViewResult = (result) => {
    setSelectedResult(result);
    setModalOpen(true);
  };

  const handleViewAnswers = async (result) => {
    setSelectedResult(result);
    setLoadingAnswers(true);
    setAnswerModal(true);
    try {
      const { data } = await getAnswerReview(result.id);
      setAnswers(data.answers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnswers(false);
    }
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
    setTimeout(() => setBanner({ ...banner, open: false }), 3000);
  };

  const handleDeleteResult = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setResults(results.filter(r => r.id !== selectedResult.id));
    setBanner({ open: true, message: 'Result deleted successfully!', type: 'success' });
    setEditModalOpen(false);
    setLoading(false);
    setTimeout(() => setBanner({ ...banner, open: false }), 3000);
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      setTimeout(() => {
        setBanner({ open: true, message: 'Results uploaded successfully!', type: 'success' });
        setLoading(false);
        setTimeout(() => setBanner({ ...banner, open: false }), 3000);
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

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Result Management</h1>
              <p className="text-white/50">Analyze performance and manage student grades.</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none cursor-pointer hover:bg-white/10 transition-colors"
                >
                  {batches.map(batch => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                type="text"
                placeholder="Search Student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              />
            </div>
            <div className="relative">
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              >
                <option value="">All Exams</option>
                {exams.map(exam => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" size={16} />
            </div>
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Results Table */}
          <Card variant="glass" className="p-0 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Student Results</h3>
              <Button variant="secondary" onClick={handleExport} size="sm">
                <Download size={16} className="mr-2" /> Export CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wider">
                  <tr>
                    {['Student', 'Batch', 'Exam', 'Subject', 'Marks', '%', 'Grade', 'Type', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-4 font-medium border-b border-white/10">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredResults.slice(0, 25).map((row) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={row.studentAvatar} alt={row.studentName} className="w-8 h-8 rounded-full bg-white/10" />
                          <div>
                            <div className="font-medium text-white">{row.studentName}</div>
                            <div className="text-xs text-white/40">{row.studentId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/70">{row.batch}</td>
                      <td className="px-6 py-4 text-sm text-white/70">{row.examName}</td>
                      <td className="px-6 py-4 text-sm text-white/70">{row.subjectName}</td>
                      <td className="px-6 py-4 text-sm text-white font-mono">{row.marksObtained} / {row.totalMarks}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${row.percentage >= 75 ? 'bg-emerald-500' : row.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${row.percentage}%` }} />
                          </div>
                          <span className="text-xs text-white/60">{row.percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-white">{row.grade}</td>
                      <td className="px-6 py-4">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          row.submissionType === 'violation' ? 'bg-red-500/10 text-red-400' :
                          row.submissionType === 'timeout' ? 'bg-amber-500/10 text-amber-400' :
                          row.submissionType === 'auto' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-white/5 text-white/40'
                        }`}>
                          {row.submissionType || 'manual'}
                          {row.tabSwitchCount > 0 && ` (${row.tabSwitchCount}⚠)`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${row.status === 'Pass'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleViewResult(row)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-blue-400 transition-colors" title="View"><Eye size={16} /></button>
                          <button onClick={() => handleViewAnswers(row)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-cyan-400 transition-colors" title="Answers"><FileText size={16} /></button>
                          <button onClick={() => handleEditResult(row)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-amber-400 transition-colors" title="Edit"><Pencil size={16} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="glass" className="h-[400px]">
              <h3 className="text-lg font-semibold text-white mb-6">Performance Comparison</h3>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={analytics.performance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card variant="glass" className="h-[400px]">
              <h3 className="text-lg font-semibold text-white mb-6">Performance Trend</h3>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={analytics.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="month" stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="average" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="glass" className="md:col-span-2 p-0 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Top Performers</h3>
              </div>
              <table className="w-full text-left">
                <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 font-medium">Rank</th>
                    <th className="px-6 py-3 font-medium">Student</th>
                    <th className="px-6 py-3 font-medium">Subject</th>
                    <th className="px-6 py-3 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredByBatch.sort((a, b) => b.percentage - a.percentage).slice(0, 5).map((result, index) => (
                    <tr key={result.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-3">
                        {index < 3 ? (
                          <span className="text-lg">{['🥇','🥈','🥉'][index]}</span>
                        ) : (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-white/10 text-white/60">
                            {index + 1}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm text-white">{result.studentName}</td>
                      <td className="px-6 py-3 text-sm text-white/70">{result.subjectName}</td>
                      <td className="px-6 py-3 text-sm font-bold text-white">{result.percentage.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <Card variant="glass" className="h-[350px]">
              <h3 className="text-lg font-semibold text-white mb-6">Grade Distribution</h3>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={analytics.distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(analytics.distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Upload Section */}
          <Card variant="glass" className="border-dashed border-2 border-white/20 hover:border-blue-500/50 transition-colors cursor-pointer group">
            <div className="flex flex-col items-center justify-center py-12" onClick={() => fileInputRef.current.click()}>
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Upload size={32} className="text-white/60 group-hover:text-blue-400 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Bulk Result Upload</h3>
              <p className="text-white/50 text-sm mb-6">Drag & drop CSV file here or click to browse</p>
              <div className="text-xs text-white/30 bg-white/5 px-3 py-1 rounded-full">Supported format: CSV</div>
              <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleUpload} />
            </div>
          </Card>

        </div>
      </div>

      {/* View Result Modal */}
      <AnimatePresence>
        {modalOpen && selectedResult && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
            >
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold text-white">Result Details</h2>
                <button onClick={() => setModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 mb-8">
                  <img src={selectedResult.studentAvatar} alt={selectedResult.studentName} className="w-16 h-16 rounded-full ring-2 ring-white/10" />
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedResult.studentName}</h3>
                    <p className="text-white/50">{selectedResult.studentId} • {selectedResult.batch}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-sm text-white/50">Exam Date</div>
                    <div className="text-white font-medium">{selectedResult.date}</div>
                  </div>
                </div>

                <div className="flex gap-4 mb-6 border-b border-white/10">
                  <button
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative ${tabValue === 0 ? 'text-blue-400' : 'text-white/50 hover:text-white'}`}
                    onClick={() => setTabValue(0)}
                  >
                    Result Summary
                    {tabValue === 0 && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />}
                  </button>
                  <button
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative ${tabValue === 1 ? 'text-blue-400' : 'text-white/50 hover:text-white'}`}
                    onClick={() => setTabValue(1)}
                  >
                    Performance Analysis
                    {tabValue === 1 && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />}
                  </button>
                </div>

                {tabValue === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-sm text-white/50 mb-1">Subject</div>
                      <div className="text-lg font-bold text-white">{selectedResult.subjectName}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-sm text-white/50 mb-1">Score</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">{selectedResult.marksObtained}</span>
                        <span className="text-white/40">/ {selectedResult.totalMarks}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-sm text-white/50 mb-1">Grade</div>
                      <div className="text-2xl font-bold text-white">{selectedResult.grade}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-sm text-white/50 mb-1">Status</div>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium border mt-1 ${selectedResult.status === 'Pass'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                        {selectedResult.status}
                      </span>
                    </div>
                    <div className="md:col-span-2 p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-sm text-white/50 mb-1">Remarks</div>
                      <p className="text-white/80 text-sm">{selectedResult.remarks}</p>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                      <Button variant="outline"><Printer size={16} className="mr-2" /> Print</Button>
                      <Button variant="primary"><Download size={16} className="mr-2" /> Download PDF</Button>
                    </div>
                  </div>
                )}

                {tabValue === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-white/70 mb-4">Comparison with Class Average</h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[{ name: selectedResult.subjectName, Student: selectedResult.percentage, ClassAverage: 72 }]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                            <YAxis stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                            <RechartsTooltip
                              contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                              itemStyle={{ color: '#fff' }}
                              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Legend />
                            <Bar dataKey="Student" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="ClassAverage" fill="#6b7280" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Result Modal */}
      <AnimatePresence>
        {editModalOpen && selectedResult && (
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
                <h2 className="text-xl font-bold text-white">Edit Result</h2>
                <button onClick={() => setEditModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Marks Obtained" type="number" value={editForm.marksObtained || ''} onChange={(e) => setEditForm({ ...editForm, marksObtained: parseInt(e.target.value) })} />
                  <InputGroup label="Total Marks" type="number" value={editForm.totalMarks || ''} onChange={(e) => setEditForm({ ...editForm, totalMarks: parseInt(e.target.value) })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SelectGroup label="Grade" value={editForm.grade || ''} onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}>
                    {['A+', 'A', 'B', 'C', 'D', 'E', 'F'].map(grade => (<option key={grade} value={grade}>{grade}</option>))}
                  </SelectGroup>
                  <SelectGroup label="Status" value={editForm.status || ''} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                  </SelectGroup>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Remarks</label>
                  <textarea
                    rows={3}
                    value={editForm.remarks || ''}
                    onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none"
                  />
                </div>
                <div className="pt-4 flex justify-between items-center">
                  <Button variant="danger" onClick={handleDeleteResult}><Trash2 size={16} className="mr-2" /> Delete</Button>
                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                    <Button variant="accent" onClick={handleSaveEdit}><Save size={16} className="mr-2" /> Save Changes</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Banner */}
      <AnimatePresence>
        {banner.open && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <div className="bg-[#121212] border border-emerald-500/20 rounded-xl shadow-2xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CheckCircle size={18} />
              </div>
              <div className="text-white font-medium">{banner.message}</div>
              <button onClick={() => setBanner({ ...banner, open: false })} className="ml-4 text-white/40 hover:text-white">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer Review Modal */}
      <AnimatePresence>
        {answerModal && selectedResult && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            >
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-white">Answer Review</h2>
                  <p className="text-white/50 text-sm">{selectedResult.studentName} — {selectedResult.examName}</p>
                </div>
                <button onClick={() => setAnswerModal(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingAnswers ? (
                  <div className="text-center text-white/40 py-8">Loading answers...</div>
                ) : answers.length === 0 ? (
                  <div className="text-center text-white/40 py-8">No answer data available.</div>
                ) : (
                  answers.map((q, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${
                      q.isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs font-bold text-white/70">{q.questionNumber}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            q.type === 'mcq' ? 'bg-blue-500/10 text-blue-400' : q.type === 'true-false' ? 'bg-purple-500/10 text-purple-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>{q.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            q.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {q.isCorrect ? `✅ +${q.marksAwarded}` : `❌ ${q.marksAwarded}`}
                          </span>
                        </div>
                      </div>
                      <p className="text-white text-sm mb-3">{q.text}</p>
                      {(q.type === 'mcq' || q.type === 'true-false') && q.options && (
                        <div className="space-y-1.5">
                          {q.options.map((opt, oi) => {
                            const isCorrect = oi === q.correctIndex;
                            const isSelected = oi === q.studentAnswer?.chosenIndex;
                            return (
                              <div key={oi} className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 ${
                                isCorrect ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                isSelected && !isCorrect ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                'bg-white/5 text-white/50'
                              }`}>
                                <span className="font-bold">{String.fromCharCode(65+oi)}.</span> {opt}
                                {isCorrect && <span className="ml-auto">✓ Correct</span>}
                                {isSelected && !isCorrect && <span className="ml-auto">✗ Selected</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {q.type === 'short' && (
                        <div className="space-y-1.5">
                          <div className="px-3 py-1.5 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Correct: {q.correctAnswer}
                          </div>
                          <div className={`px-3 py-1.5 rounded-lg text-xs ${
                            q.isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          } border border-white/10`}>
                            Student: {q.studentAnswer?.textAnswer || '(no answer)'}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ResultManagement;
