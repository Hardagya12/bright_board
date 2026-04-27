import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Eye, Pencil, Download, Search, X, Upload, Printer, Save, Trash2, ChevronDown, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import Button from '../../components/ui/Button';
import { listTutorResults, getResultsAnalytics, getAnswerReview } from '../../utils/services/results';
import { listBatches } from '../../utils/services/batches';


const COLORS = ['#ffd11a', '#9fe870', '#00ff88', '#ffc091', '#ffaa00', '#6366F1'];

const InputGroup = ({ label, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-[#868685] uppercase tracking-widest ml-1">{label}</label>
    <input
      className="w-full bg-[#f9faf6] border border-[#e8ebe6] rounded-full px-5 py-3 text-sm font-medium tracking-wide text-[#0e0f0c] focus:border-cyan-400 focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] outline-none transition-all shadow-inner placeholder:text-[#e8ebe6]"
      {...props}
    />
  </div>
);

const SelectGroup = ({ label, children, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-[#868685] uppercase tracking-widest ml-1">{label}</label>
    <select
      className="w-full bg-[#f9faf6] border border-[#e8ebe6] rounded-full px-5 py-3 text-sm font-medium tracking-wide text-[#0e0f0c] focus:border-cyan-400 focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] outline-none transition-all shadow-inner custom-select appearance-none cursor-pointer pr-10"
      style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem top 50%', backgroundSize: '0.65rem auto' }}
      {...props}
    >
      {children}
    </select>
  </div>
);

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
          studentAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(r.studentName)}&background=111118&color=00f5ff&bold=true`,
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
    setBanner({ open: true, message: 'Record removed successfully.', type: 'success' });
    setEditModalOpen(false);
    setLoading(false);
    setTimeout(() => setBanner({ ...banner, open: false }), 3000);
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      setTimeout(() => {
        setBanner({ open: true, message: 'CSV Data imported successfully.', type: 'success' });
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
    link.download = `student_results_export_${selectedBatch}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bb-offwhite)] font-body relative">
      <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
      
      
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative z-10 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-10">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0e0f0c] tracking-tight font-display mb-2">Results & Analytics</h1>
              <p className="text-[#868685] tracking-wide mt-2">Monitor student performance and exam outcomes.</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="appearance-none bg-white border border-[#e8ebe6] rounded-full pl-5 pr-12 py-3 text-[#0e0f0c] text-sm font-bold tracking-wide shadow-sm outline-none cursor-pointer custom-select "
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem top 50%', backgroundSize: '0.65rem auto' }}
                >
                  {batches.map(batch => (
                    <option key={batch} value={batch}>{batch === 'All' ? 'All Batches' : `Batch: ${batch}`}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bb-card p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bb-card-accent shadow-sm">
            <div className="relative">
              <Search className="absolute left-5 top-3.5 text-[#868685]" size={18} />
              <input
                type="text"
                placeholder="Search student name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#f9faf6] border border-[#e8ebe6] rounded-full pl-12 pr-5 py-3.5 text-sm font-medium tracking-wide text-[#0e0f0c] placeholder:text-[#868685] focus:border-cyan-400 outline-none transition-all shadow-inner focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)]"
              />
            </div>
            <div className="relative">
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full appearance-none bg-[#f9faf6] border border-[#e8ebe6] rounded-full px-5 py-3.5 text-sm font-medium tracking-wide text-[#0e0f0c] focus:border-cyan-400 outline-none transition-all shadow-inner focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] custom-select cursor-pointer pr-10"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem top 50%', backgroundSize: '0.65rem auto' }}
              >
                <option value="">All Exams</option>
                {exams.map(exam => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
              </select>
            </div>
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full appearance-none bg-[#f9faf6] border border-[#e8ebe6] rounded-full px-5 py-3.5 text-sm font-medium tracking-wide text-[#0e0f0c] focus:border-cyan-400 outline-none transition-all shadow-inner focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] custom-select cursor-pointer pr-10"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem top 50%', backgroundSize: '0.65rem auto' }}
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </div>
          </div>

          {/* Results Table */}
          <div className="bb-card overflow-hidden shadow-md">
            <div className="p-6 md:p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.02]">
              <h3 className="text-xl font-bold text-[#0e0f0c] font-display tracking-wide">Student Performance Records</h3>
              <Button onClick={handleExport} className="px-5 py-2.5 rounded-full text-sm font-bold tracking-wide border border-[#e8ebe6] text-[#0e0f0c] hover:bg-white/10 hover:border-white/30 transition-all shadow-inner flex items-center gap-2">
                <Download size={16} /> Export CSV
              </Button>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f9faf6] text-[#868685] text-[10px] uppercase tracking-widest font-bold border-b border-[#e8ebe6]">
                  <tr>
                    {['Student', 'Batch', 'Exam', 'Subject', 'Score', 'Percentage', 'Grade', 'Type', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm font-medium tracking-wide">
                  {filteredResults.slice(0, 25).map((row) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/[0.04] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={row.studentAvatar} alt={row.studentName} className="w-10 h-10 rounded-[12px] border border-[#e8ebe6] shadow-inner" />
                          <div>
                            <div className="font-bold text-[#0e0f0c] group-hover:text-[#9fe870] transition-colors">{row.studentName}</div>
                            <div className="text-[10px] font-bold text-[#868685] tracking-widest uppercase">{row.studentId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#454745]">
                         <span className="px-3 py-1 rounded-full bg-white border border-[#e8ebe6] text-[10px] font-bold uppercase tracking-widest shadow-inner">{row.batch}</span>
                      </td>
                      <td className="px-6 py-4 text-[#454745]">{row.examName}</td>
                      <td className="px-6 py-4 text-[#454745]">{row.subjectName}</td>
                      <td className="px-6 py-4">
                         <span className="font-bold text-[#0e0f0c]">{row.marksObtained}</span>
                         <span className="text-[#868685] mx-1">/</span>
                         <span className="text-[#868685]">{row.totalMarks}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 w-32">
                          <div className="h-2 flex-1 bg-white border border-white/5 rounded-full overflow-hidden shadow-inner">
                            <div className={`h-full rounded-full ${row.percentage >= 75 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : row.percentage >= 50 ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'bg-gradient-to-r from-pink-500 to-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.8)]'}`} style={{ width: `${row.percentage}%` }} />
                          </div>
                          <span className="text-xs font-bold text-[#454745]">{row.percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#0e0f0c] text-base">{row.grade}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 border rounded-full text-[10px] font-bold tracking-widest uppercase shadow-inner ${
                          row.submissionType === 'violation' ? 'bg-pink-500/10 text-pink-400 border-pink-500/30' :
                          row.submissionType === 'timeout' ? 'bg-amber-500/10 text-[#9fe870] border-[#9fe870]' :
                          row.submissionType === 'auto' ? 'bg-cyan-500/10 text-[#9fe870] border-cyan-500/30' :
                          'bg-white text-[#868685] border-[#e8ebe6]'
                        }`}>
                          {row.submissionType || 'manual'}
                          {row.tabSwitchCount > 0 && ` (${row.tabSwitchCount}⚠)`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full uppercase text-[10px] font-bold border shadow-inner ${row.status === 'Pass'
                            ? 'bg-emerald-500/10 text-[#9fe870] border-[#163300]/30'
                            : 'bg-pink-500/10 text-pink-400 border-pink-500/30'
                          }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleViewResult(row)} className="w-8 h-8 rounded-[10px] border border-[#e8ebe6] bg-white hover:bg-cyan-500/20 hover:border-cyan-500/30 hover:text-[#9fe870] transition-colors flex items-center justify-center text-[#868685] shadow-inner" title="View"><Eye size={14} /></button>
                          <button onClick={() => handleViewAnswers(row)} className="w-8 h-8 rounded-[10px] border border-[#e8ebe6] bg-white hover:bg-purple-500/20 hover:border-[#9fe870] hover:text-[#9fe870] transition-colors flex items-center justify-center text-[#868685] shadow-inner" title="Answers"><FileText size={14} /></button>
                          <button onClick={() => handleEditResult(row)} className="w-8 h-8 rounded-[10px] border border-[#e8ebe6] bg-white hover:bg-amber-500/20 hover:border-[#9fe870] hover:text-[#9fe870] transition-colors flex items-center justify-center text-[#868685] shadow-inner" title="Edit"><Pencil size={14} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bb-card p-6 md:p-8 h-[450px] relative overflow-hidden bb-card-accent shadow-md">
              <h3 className="text-xl font-bold text-[#0e0f0c] mb-6 font-display tracking-tight flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-[#9fe870] border border-cyan-500/20"><BarChart size={16}/></div>
                 Performance by Subject
              </h3>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={analytics.performance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dx={-10} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                    itemStyle={{ color: '#ffd11a', fontWeight: 'bold' }}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar dataKey="average" fill="url(#colorCyan)" radius={[8, 8, 8, 8]} barSize={40} />
                  <defs>
                     <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ffd11a" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#ffd11a" stopOpacity={0.2}/>
                     </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bb-card p-6 md:p-8 h-[450px] relative overflow-hidden bb-card-accent shadow-md">
              <h3 className="text-xl font-bold text-[#0e0f0c] mb-6 font-display tracking-tight flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-[#9fe870] border border-purple-500/20"><LineChart size={16}/></div>
                 Performance Trend
              </h3>
              <ResponsiveContainer width="100%" height="80%">
                <LineChart data={analytics.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dx={-10} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                  />
                  <Line type="monotone" dataKey="average" stroke="#9fe870" strokeWidth={4} dot={{ fill: '#ffffff', stroke: '#9fe870', strokeWidth: 3, r: 6 }} activeDot={{ r: 8, fill: '#9fe870', stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bb-card lg:col-span-2 overflow-hidden shadow-md bb-card-accent">
              <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-xl font-bold text-[#0e0f0c] font-display tracking-tight">Top Performers</h3>
              </div>
              <div className="p-2">
                 <table className="w-full text-left">
                   <thead className="text-[#868685] text-[10px] uppercase tracking-widest font-bold">
                     <tr>
                       <th className="px-6 py-4">Rank</th>
                       <th className="px-6 py-4">Student Name</th>
                       <th className="px-6 py-4">Subject</th>
                       <th className="px-6 py-4 text-right">Score</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                     {filteredByBatch.sort((a, b) => b.percentage - a.percentage).slice(0, 5).map((result, index) => (
                       <tr key={result.id} className="hover:bg-white/[0.04] transition-colors group">
                         <td className="px-6 py-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border shadow-inner ${index === 0 ? 'bg-amber-500/20 text-[#9fe870] border-amber-500/40 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : index === 1 ? 'bg-slate-300/20 text-slate-300 border-slate-300/40' : index === 2 ? 'bg-orange-400/20 text-orange-400 border-orange-400/40' : 'bg-white text-[#868685] border-[#e8ebe6]'}`}>
                               {index + 1}
                            </div>
                         </td>
                         <td className="px-6 py-4 text-sm text-[#0e0f0c] font-bold tracking-wide">{result.studentName}</td>
                         <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full bg-[#f9faf6] border border-white/5 text-xs text-[#868685] font-medium">{result.subjectName}</span>
                         </td>
                         <td className="px-6 py-4 text-sm font-bold text-[#9fe870] text-right">{result.percentage.toFixed(1)}%</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
              </div>
            </div>
            
            <div className="bb-card p-6 md:p-8 h-[350px] lg:h-auto relative overflow-hidden shadow-md">
              <h3 className="text-xl font-bold text-[#0e0f0c] mb-6 font-display tracking-tight text-center">Grade Distribution</h3>
              <div className="h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={analytics.distribution}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={85}
                       paddingAngle={5}
                       dataKey="value"
                       stroke="none"
                     >
                       {(analytics.distribution || []).map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none hover:opacity-80 transition-opacity" />
                       ))}
                     </Pie>
                     <RechartsTooltip
                       contentStyle={{ backgroundColor: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                       itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                     />
                     <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }} />
                   </PieChart>
                 </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div 
            className="bb-card p-12 text-center border-dashed border-[#e8ebe6] hover:border-[#9fe870] hover:bg-white/[0.06] transition-all cursor-pointer group rounded-[32px]"
            onClick={() => fileInputRef.current.click()}
          >
            <div className="w-20 h-20 rounded-full bg-white border border-[#e8ebe6] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <Upload size={32} className="text-[#868685] group-hover:text-[#9fe870] transition-colors" />
            </div>
            <h3 className="text-2xl font-bold text-[#0e0f0c] mb-3 font-display tracking-wide">Import External Results</h3>
            <p className="text-[#868685] text-sm font-medium tracking-wide mb-6 max-w-md mx-auto">Upload a CSV file containing offline exam results to integrate them into the platform analytics.</p>
            <span className="px-4 py-2 rounded-full bg-[#f9faf6] border border-[#e8ebe6] text-[10px] text-[#868685] font-bold uppercase tracking-widest shadow-inner">Requires Standard CSV Format</span>
            <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleUpload} />
          </div>

        </div>
      </div>

      {/* View Result Modal */}
      <AnimatePresence>
        {modalOpen && selectedResult && (
          <motion.div className="fixed inset-0 bg-[var(--bb-offwhite)]/80  z-50 flex items-center justify-center p-4 font-body" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bb-card w-full max-w-3xl overflow-hidden shadow-xl relative rounded-[32px] border-[#9fe870]" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
              <div className="absolute top-0 left-10 right-10 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 blur-sm rounded-full"></div>
              <div className="px-8 py-6 border-b border-[#e8ebe6] flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-2xl font-bold text-[#0e0f0c] tracking-tight font-display">Performance Report</h2>
                <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-full bg-white border border-[#e8ebe6] flex items-center justify-center text-[#868685] hover:text-[#0e0f0c] hover:bg-white/10 transition-colors"><X size={18} /></button>
              </div>

              <div className="p-8 bg-[#f9faf6]">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 p-6 bg-white/[0.02] border border-white/5 rounded-[24px] shadow-inner text-center md:text-left">
                  <img src={selectedResult.studentAvatar} alt={selectedResult.studentName} className="w-24 h-24 rounded-[20px] shadow-lg border border-[#e8ebe6]" />
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-[#0e0f0c] font-display tracking-tight">{selectedResult.studentName}</h3>
                    <p className="text-[#868685] text-sm font-medium tracking-wide mt-2">ID: {selectedResult.studentId} • Batch: {selectedResult.batch}</p>
                  </div>
                  <div className="md:text-right">
                    <div className="text-[10px] text-[#868685] uppercase font-bold tracking-widest mb-1">Submitted On</div>
                    <div className="text-[#0e0f0c] font-bold tracking-wide">{selectedResult.date}</div>
                  </div>
                </div>

                <div className="flex gap-4 mb-8 border-b border-[#e8ebe6] font-bold text-sm tracking-wide">
                  <button className={`pb-4 px-4 transition-colors relative ${tabValue === 0 ? 'text-[#9fe870]' : 'text-[#868685] hover:text-[#0e0f0c]'}`} onClick={() => setTabValue(0)}>
                    Overview
                    {tabValue === 0 && <motion.div layoutId="activeTabRes" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(0,245,255,0.5)]" />}
                  </button>
                  <button className={`pb-4 px-4 transition-colors relative ${tabValue === 1 ? 'text-[#9fe870]' : 'text-[#868685] hover:text-[#0e0f0c]'}`} onClick={() => setTabValue(1)}>
                    Subject Analysis
                    {tabValue === 1 && <motion.div layoutId="activeTabRes" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(0,245,255,0.5)]" />}
                  </button>
                </div>

                {tabValue === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5 shadow-inner">
                      <div className="text-[10px] text-[#868685] uppercase font-bold tracking-widest mb-2">Subject</div>
                      <div className="text-xl font-bold text-[#0e0f0c] tracking-wide">{selectedResult.subjectName}</div>
                    </div>
                    <div className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5 shadow-inner relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 w-24 h-24 bg-purple-500/10 rounded-full blur-[30px]"></div>
                      <div className="text-[10px] text-[#868685] uppercase font-bold tracking-widest mb-2">Score Received</div>
                      <div className="flex items-baseline gap-2 relative z-10">
                        <span className="text-4xl font-bold text-[#9fe870]">{selectedResult.marksObtained}</span>
                        <span className="text-[#868685] font-bold">/ {selectedResult.totalMarks}</span>
                      </div>
                    </div>
                    <div className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5 shadow-inner relative overflow-hidden">
                       <div className="absolute right-0 bottom-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-[30px]"></div>
                      <div className="text-[10px] text-[#868685] uppercase font-bold tracking-widest mb-2">Grade</div>
                      <div className="text-4xl font-bold text-[#9fe870] relative z-10">{selectedResult.grade}</div>
                    </div>
                    <div className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5 shadow-inner flex flex-col justify-center items-start">
                      <div className="text-[10px] text-[#868685] uppercase font-bold tracking-widest mb-3">Status</div>
                      <span className={`inline-block px-4 py-2 text-sm font-bold uppercase tracking-widest rounded-full border shadow-inner ${selectedResult.status === 'Pass'
                          ? 'bg-emerald-500/10 text-[#9fe870] border-[#163300]/30'
                          : 'bg-pink-500/10 text-pink-400 border-pink-500/30'
                        }`}>
                        {selectedResult.status}
                      </span>
                    </div>
                    <div className="md:col-span-2 p-6 rounded-[24px] bg-white/[0.02] border border-white/5 shadow-inner">
                      <div className="text-[10px] text-[#868685] uppercase font-bold tracking-widest mb-3">Tutor Remarks</div>
                      <p className="text-[#0e0f0c]/80 text-sm font-medium leading-relaxed">{selectedResult.remarks || 'No remarks provided for this evaluation.'}</p>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                      <Button variant="ghost" className="rounded-full px-6 flex items-center gap-2"><Printer size={16} /> Print</Button>
                      <Button className="btn-primary rounded-full px-6 shadow-glow-cyan flex items-center gap-2"><Download size={16} /> Download PDF</Button>
                    </div>
                  </div>
                )}

                {tabValue === 1 && (
                  <div className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5 shadow-inner h-72 flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-[#454745] tracking-wide text-center mb-6">Score vs Baseline Expectation</h4>
                    <ResponsiveContainer width="100%" height="80%">
                      <BarChart data={[{ name: selectedResult.subjectName, Student: selectedResult.percentage, Baseline: 72 }]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} itemStyle={{ color: '#fff', fontWeight: 'bold' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
                        <Bar dataKey="Student" fill="#ffd11a" radius={[4,4,4,4]} barSize={40} />
                        <Bar dataKey="Baseline" fill="rgba(255,255,255,0.2)" radius={[4,4,4,4]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
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
          <motion.div className="fixed inset-0 bg-[var(--bb-offwhite)]/80  z-50 flex items-center justify-center p-4 font-body" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bb-card w-full max-w-lg overflow-hidden shadow-xl relative rounded-[32px] border-[#9fe870]" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
              <div className="absolute top-0 left-10 right-10 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-50 blur-sm rounded-full"></div>
              <div className="px-8 py-6 border-b border-[#e8ebe6] flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-2xl font-bold text-[#0e0f0c] tracking-tight font-display">Edit Result Record</h2>
                <button onClick={() => setEditModalOpen(false)} className="w-8 h-8 rounded-full bg-white border border-[#e8ebe6] flex items-center justify-center text-[#868685] hover:text-[#0e0f0c] hover:bg-white/10 transition-colors"><X size={18} /></button>
              </div>
              <div className="p-8 space-y-6 bg-[#f9faf6]">
                <div className="grid grid-cols-2 gap-6">
                  <InputGroup label="Marks Obtained" type="number" value={editForm.marksObtained || ''} onChange={(e) => setEditForm({ ...editForm, marksObtained: parseInt(e.target.value) })} />
                  <InputGroup label="Total Marks" type="number" value={editForm.totalMarks || ''} onChange={(e) => setEditForm({ ...editForm, totalMarks: parseInt(e.target.value) })} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <SelectGroup label="Grade" value={editForm.grade || ''} onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}>
                    {['A+', 'A', 'B', 'C', 'D', 'E', 'F'].map(grade => (<option key={grade} value={grade}>{grade}</option>))}
                  </SelectGroup>
                  <SelectGroup label="Status" value={editForm.status || ''} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                  </SelectGroup>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#868685] uppercase tracking-widest ml-1">Remarks</label>
                  <textarea rows={3} value={editForm.remarks || ''} onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                    className="w-full bg-[#f9faf6] border border-[#e8ebe6] rounded-[24px] px-5 py-4 text-sm font-medium tracking-wide text-[#0e0f0c] focus:border-amber-400 focus:shadow-[inset_0_0_15px_rgba(251,191,36,0.1)] outline-none transition-all resize-none shadow-inner"
                  />
                </div>
                <div className="pt-8 border-t border-[#e8ebe6] flex justify-between items-center mt-6">
                  <Button variant="outline" onClick={handleDeleteResult} className="rounded-full border-red-500/30 text-red-400 hover:bg-red-500/10 px-5 text-sm flex items-center gap-2"><Trash2 size={16} /> Delete</Button>
                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setEditModalOpen(false)} className="rounded-full px-6">Cancel</Button>
                    <Button onClick={handleSaveEdit} className="bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-full px-8 shadow-[0_0_20px_rgba(251,191,36,0.3)] flex items-center gap-2"><Save size={16} /> Save</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer Review Modal */}
      <AnimatePresence>
        {answerModal && selectedResult && (
          <motion.div className="fixed inset-0 bg-[var(--bb-offwhite)]/80  z-50 flex items-center justify-center p-4 font-body" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bb-card w-full max-w-4xl max-h-[90vh] flex flex-col relative shadow-xl rounded-[32px] border-[#9fe870] overflow-hidden" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
              <div className="absolute top-0 left-10 right-10 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 blur-sm rounded-full"></div>
              <div className="px-8 py-6 border-b border-[#e8ebe6] flex justify-between items-center bg-white/[0.02] shrink-0">
                <div>
                  <h2 className="text-2xl font-bold text-[#0e0f0c] tracking-tight font-display">Student Submission</h2>
                  <p className="text-[#868685] text-sm font-medium tracking-wide mt-1">{selectedResult.studentName} • {selectedResult.examName}</p>
                </div>
                <button onClick={() => setAnswerModal(false)} className="w-8 h-8 rounded-full bg-white border border-[#e8ebe6] flex items-center justify-center text-[#868685] hover:text-[#0e0f0c] hover:bg-white/10 transition-colors"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-[#f9faf6] custom-scrollbar">
                {loadingAnswers ? (
                  <div className="space-y-4">
                     {[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-[24px] bg-white" />)}
                  </div>
                ) : answers.length === 0 ? (
                  <div className="text-center py-16">
                     <div className="w-16 h-16 rounded-full bg-white border border-[#e8ebe6] flex items-center justify-center mx-auto mb-4 shadow-inner"><FileText size={24} className="text-[#868685]" /></div>
                     <p className="text-[#868685] font-medium tracking-wide text-lg">No submission data available.</p>
                  </div>
                ) : (
                  answers.map((q, idx) => (
                    <div key={idx} className="bb-card p-6 md:p-8 relative overflow-hidden group shadow-sm">
                      <div className={`absolute left-0 top-0 w-1.5 h-full ${q.isCorrect ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.5)]'}`}></div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-white/5 pb-5">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-[12px] border border-[#e8ebe6] bg-white flex items-center justify-center text-sm font-bold text-[#454745] shadow-inner">{q.questionNumber}</span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-inner ${
                            q.type === 'mcq' ? 'bg-cyan-500/10 text-[#9fe870] border-cyan-500/30' : q.type === 'true-false' ? 'bg-purple-500/10 text-[#9fe870] border-[#9fe870]' : 'bg-amber-500/10 text-[#9fe870] border-[#9fe870]'
                          }`}>{q.type}</span>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border shadow-inner ${
                          q.isCorrect ? 'bg-emerald-500/10 text-[#9fe870] border-[#163300]/30' : 'bg-pink-500/10 text-pink-400 border-pink-500/30'
                        }`}>
                          {q.isCorrect ? `+${q.marksAwarded} Marks` : `Incorrect (-${q.marksAwarded})`}
                        </span>
                      </div>
                      
                      <p className="text-[#0e0f0c] text-base md:text-lg mb-6 font-medium leading-relaxed">{q.text}</p>
                      
                      {(q.type === 'mcq' || q.type === 'true-false') && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options.map((opt, oi) => {
                            const isCorrect = oi === q.correctIndex;
                            const isSelected = oi === q.studentAnswer?.chosenIndex;
                            return (
                              <div key={oi} className={`px-5 py-3.5 rounded-[16px] text-sm font-medium tracking-wide flex items-center gap-4 border shadow-inner ${
                                isCorrect ? 'bg-emerald-500/10 border-emerald-500/40 text-[#9fe870] shadow-[inset_0_0_15px_rgba(52,211,153,0.1)]' :
                                isSelected && !isCorrect ? 'bg-pink-500/10 border-pink-500/40 text-pink-400 shadow-[inset_0_0_15px_rgba(244,114,182,0.1)]' :
                                'bg-[#f9faf6] border-white/5 text-[#868685]'
                              }`}>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${isCorrect ? 'border-emerald-500/50 bg-emerald-500/20 text-[#9fe870]' : isSelected && !isCorrect ? 'border-pink-500/50 bg-pink-500/20 text-pink-400' : 'border-[#e8ebe6] bg-white text-[#868685]'}`}>{String.fromCharCode(65+oi)}</span> 
                                <span className="truncate">{opt}</span>
                                {isCorrect && <CheckCircle size={16} className="ml-auto text-[#9fe870]" />}
                                {isSelected && !isCorrect && <X size={16} className="ml-auto text-pink-400" />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {q.type === 'short' && (
                        <div className="space-y-4 mt-6">
                          <div className="px-5 py-4 rounded-[16px] bg-emerald-500/10 border border-[#163300]/30 text-[#9fe870] flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 shadow-inner">
                            <span className="text-[#9fe870]/60 text-[10px] font-bold uppercase tracking-widest w-24">Expected:</span> 
                            <span className="font-bold text-sm tracking-wide">{q.correctAnswer}</span>
                          </div>
                          <div className={`px-5 py-4 rounded-[16px] border flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 shadow-inner ${
                            q.isCorrect ? 'bg-emerald-500/10 border-[#163300]/30 text-[#9fe870]' : 'bg-pink-500/10 border-pink-500/30 text-pink-400'
                          }`}>
                            <span className="opacity-60 text-[10px] font-bold uppercase tracking-widest w-24">Received:</span> 
                            <span className="font-bold text-sm tracking-wide">{q.studentAnswer?.textAnswer || 'No Answer'}</span>
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

      {/* Notification Banner */}
      <AnimatePresence>
        {banner.open && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-8 right-8 z-50">
            <div className="bb-card px-6 py-4 flex items-center gap-4 rounded-full border-[#163300]/30 shadow-[0_10px_30px_rgba(52,211,153,0.2)] bg-[#e2f6d5]">
              <div className="w-8 h-8 rounded-full border border-emerald-500/50 bg-emerald-500/20 flex items-center justify-center text-[#9fe870] shadow-inner">
                <CheckCircle size={16} />
              </div>
              <div className="text-[#9fe870] font-bold text-sm tracking-wide">{banner.message}</div>
              <button onClick={() => setBanner({ ...banner, open: false })} className="ml-4 text-[#868685] hover:text-[#454745] transition-colors"><X size={16} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ResultManagement;
