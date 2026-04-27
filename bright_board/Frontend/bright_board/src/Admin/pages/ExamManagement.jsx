import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Search, Edit2, Trash2, Plus, X, BookOpen, Clock, CheckCircle, AlertCircle, Play, Square, Layers, Zap, ListChecks, ToggleLeft, Type, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import Button from '../../components/ui/Button';
import { listExamsTutor, createExam, updateExam, updateExamStatus, deleteExam, getExamTutor, addQuestion, updateQuestion, deleteQuestion } from '../../utils/services/exams';
import { listBatches } from '../../utils/services/batches';

import Skeleton from '../../components/ui/Skeleton';
import ExamSettingsForm from '../components/ExamSettingsForm';

const statusStyles = {
  draft: { bg: 'bg-white', text: 'text-[#868685]', border: 'border-[#e8ebe6]', label: 'Draft' },
  scheduled: { bg: 'bg-amber-500/10', text: 'text-[#9fe870]', border: 'border-[#9fe870]', label: 'Scheduled' },
  live: { bg: 'bg-cyan-500/10', text: 'text-[#9fe870]', border: 'border-cyan-500/30', label: 'Live' },
  ended: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30', label: 'Ended' },
};



const ExamManagement = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [examModal, setExamModal] = useState(false);
  const [questionModal, setQuestionModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Exam form
  const [examForm, setExamForm] = useState({
    title: '', description: '', subject: '', scheduledDate: '', durationMinutes: 60,
    batchId: '', status: 'draft', totalMarks: 0, passingMarks: 40,
    shuffleQuestions: false, showResultImmediately: true, instructions: '',
    negativeMarkingEnabled: false, defaultNegativeMarks: 0,
  });

  // Question form
  const [qForm, setQForm] = useState({
    type: 'mcq', text: '', options: ['', '', '', ''], correctIndex: 0,
    correctAnswer: '', marks: 1, negativeMarks: 0,
  });

  // Load exams + batches
  const loadExams = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await listExamsTutor(statusFilter ? { status: statusFilter } : {});
      setExams(data.exams || []);
      try {
        const { data: b } = await listBatches({ limit: 100 });
        setBatches((b.batches || []).map(x => ({ id: x.batchId || x._id, name: x.name })));
      } catch { }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadExams(); }, [loadExams]);

  // Load questions for selected exam
  const loadQuestions = async (examId) => {
    setLoadingQuestions(true);
    try {
      const { data } = await getExamTutor(examId);
      setExamQuestions(data.questions || []);
      setSelectedExam(data.exam);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Filter
  const filtered = exams.filter(e => {
    if (searchTerm && !e.title.toLowerCase().includes(searchTerm.toLowerCase()) && !(e.subject || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // ─── Exam CRUD ────────────────────────────────────────────────────────────
  const openNewExam = () => {
    navigate('/a/exams/create');
  };

  const openEditExam = (exam) => {
    setEditingExam(exam);
    setExamForm({
      title: exam.title, description: exam.description || '', subject: exam.subject || '',
      scheduledDate: exam.scheduledDate ? format(new Date(exam.scheduledDate), 'yyyy-MM-dd') : '',
      durationMinutes: exam.durationMinutes, batchId: exam.batchId || '',
      status: exam.status || 'draft', totalMarks: exam.totalMarks || 0,
      passingMarks: exam.passingMarks || 40, shuffleQuestions: exam.shuffleQuestions || false,
      showResultImmediately: exam.showResultImmediately !== false,
      instructions: exam.instructions || '', negativeMarkingEnabled: exam.negativeMarkingEnabled || false,
      defaultNegativeMarks: exam.defaultNegativeMarks || 0,
    });
    setExamModal(true);
  };

  const saveExam = async (e) => {
    e.preventDefault();
    try {
      if (editingExam) {
        await updateExam(editingExam.id, examForm);
      } else {
        await createExam(examForm);
      }
      setExamModal(false);
      loadExams();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!confirm('Delete this exam and all its questions? This action is irreversible.')) return;
    try {
      await deleteExam(examId);
      loadExams();
      if (selectedExam?.id === examId) { setSelectedExam(null); setExamQuestions([]); }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleStatusChange = async (examId, newStatus) => {
    try {
      await updateExamStatus(examId, newStatus);
      loadExams();
      if (selectedExam?.id === examId) loadQuestions(examId);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // ─── Question CRUD ────────────────────────────────────────────────────────
  const openNewQuestion = () => {
    setEditingQuestion(null);
    setQForm({ type: 'mcq', text: '', options: ['', '', '', ''], correctIndex: 0, correctAnswer: '', marks: 1, negativeMarks: 0 });
    setQuestionModal(true);
  };

  const openEditQuestion = (q) => {
    setEditingQuestion(q);
    setQForm({
      type: q.type || 'mcq', text: q.text, options: q.options || ['', '', '', ''],
      correctIndex: q.correctIndex ?? 0, correctAnswer: q.correctAnswer || '',
      marks: q.marks || 1, negativeMarks: q.negativeMarks || 0,
    });
    setQuestionModal(true);
  };

  const saveQuestion = async (e) => {
    e.preventDefault();
    if (!selectedExam) return;
    try {
      if (editingQuestion) {
        await updateQuestion(selectedExam.id, editingQuestion.id, qForm);
      } else {
        await addQuestion(selectedExam.id, qForm);
      }
      setQuestionModal(false);
      loadQuestions(selectedExam.id);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!confirm('Delete this question?')) return;
    try {
      await deleteQuestion(selectedExam.id, qId);
      loadQuestions(selectedExam.id);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bb-offwhite)] font-body relative">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
      
      
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative z-10 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-10">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0e0f0c] font-display tracking-tight">Exam Management</h1>
              <p className="text-[#868685] tracking-wide mt-2">Create, modify, and monitor active assessments.</p>
            </div>
            {error && (
              <div className="px-5 py-3 bg-red-500/10 border border-red-500/20 rounded-[16px] text-red-400 text-sm font-medium flex items-center gap-3  shadow-[0_0_20px_rgba(248,113,113,0.1)]">
                <AlertCircle size={16} /> {error}
                <button className="ml-2 hover:text-[#0e0f0c]" onClick={() => setError('')}><X size={14} /></button>
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className="bb-card p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center bb-card-accent shadow-sm">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-5 top-3.5 text-[#868685]" size={18} />
              <input type="text" placeholder="Search exams by title or subject..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#f9faf6] border border-[#e8ebe6] rounded-full pl-12 pr-5 py-3.5 text-sm text-[#0e0f0c] placeholder:text-[#868685] focus:border-cyan-400 focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] outline-none shadow-inner transition-all" />
            </div>
            <div className="relative w-full md:w-auto">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-48 appearance-none bg-[#f9faf6] border border-[#e8ebe6] rounded-full pl-5 pr-10 py-3.5 text-sm font-medium tracking-wide text-[#0e0f0c] outline-none focus:border-cyan-400 focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] transition-all shadow-inner custom-select cursor-pointer"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem top 50%', backgroundSize: '0.65rem auto' }}>
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="ended">Ended</option>
              </select>
            </div>
            <Button onClick={openNewExam} className="w-full md:w-auto px-6 py-3.5 rounded-full font-bold tracking-wide shadow-[0_0_20px_rgba(0,245,255,0.2)] flex items-center justify-center gap-2 btn-primary">
              <Plus size={18} /> New Exam
            </Button>
          </div>

          {/* Two-Column Layout: Exam List + Question Builder */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            {/* Exam List */}
            <div className="xl:col-span-2 space-y-6">
              <h3 className="text-xl font-bold text-[#0e0f0c] font-display tracking-tight px-2 flex items-center justify-between">
                <span>Assessments</span>
                <span className="text-sm font-medium px-3 py-1 bg-white border border-[#e8ebe6] rounded-full">{filtered.length} total</span>
              </h3>
              {loading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-[24px] bg-white" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="bb-card p-10 text-center border-dashed border-[#e8ebe6] rounded-[24px]">
                  <p className="text-[#868685] tracking-wide font-medium">No exams found.</p>
                </div>
              ) : (
                <div className="space-y-4 custom-scrollbar pr-2" style={{ maxHeight: '650px', overflowY: 'auto' }}>
                  {filtered.map(exam => {
                    const st = statusStyles[exam.status || 'draft'] || statusStyles.draft;
                    const isSelected = selectedExam?.id === exam.id;
                    return (
                      <motion.div key={exam.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                        <div 
                          className={`bb-card p-6 cursor-pointer transition-all duration-300 relative overflow-hidden group ${isSelected ? 'border-[#9fe870] shadow-[0_0_30px_rgba(0,245,255,0.15)] bg-white/[0.08]' : 'hover:-translate-y-1 shadow-sm'}`}
                          onClick={() => loadQuestions(exam.id)}
                        >
                          {isSelected && <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-400 shadow-[0_0_10px_rgba(0,245,255,0.5)]"></div>}
                          
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="text-[#0e0f0c] font-bold text-lg tracking-wide max-w-[70%] group-hover:text-[#9fe870] transition-colors">{exam.title}</h4>
                            <span className={`px-3 py-1 border rounded-full text-[10px] font-bold tracking-widest uppercase shadow-inner ${st.bg} ${st.text} ${st.border}`}>{st.label}</span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#868685] mb-5">
                            <span className="px-2.5 py-1 bg-[#f9faf6] border border-white/5 rounded-full">{exam.subject || 'General'}</span>
                            <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#868685]"/> {exam.durationMinutes}m</span>
                            <span className="flex items-center gap-1.5"><Hash size={14} className="text-[#868685]"/> {exam.questionCount || 0} Q</span>
                          </div>
                          
                          <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                            {(exam.status === 'draft' || !exam.status) && (
                              <button onClick={(e) => { e.stopPropagation(); handleStatusChange(exam.id, 'live'); }}
                                className="px-4 py-2 bg-emerald-500/10 border border-[#163300]/30 text-[#9fe870] text-xs font-bold rounded-full tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-2 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]">
                                <Play size={14} /> Go Live
                              </button>
                            )}
                            {exam.status === 'scheduled' && (
                              <button onClick={(e) => { e.stopPropagation(); handleStatusChange(exam.id, 'live'); }}
                                className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-[#9fe870] text-xs font-bold rounded-full tracking-widest hover:bg-cyan-500/20 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,245,255,0.2)]">
                                <Play size={14} /> Start Now
                              </button>
                            )}
                            {exam.status === 'live' && (
                              <button onClick={(e) => { e.stopPropagation(); handleStatusChange(exam.id, 'ended'); }}
                                className="px-4 py-2 bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-bold rounded-full tracking-widest hover:bg-pink-500/20 transition-all flex items-center gap-2 shadow-[inset_0_0_15px_rgba(244,114,182,0.1)]">
                                <Square size={14} /> End Exam
                              </button>
                            )}
                            <div className="ml-auto flex gap-2">
                              <button onClick={(e) => { e.stopPropagation(); openEditExam(exam); }} className="w-8 h-8 rounded-full bg-white border border-[#e8ebe6] flex items-center justify-center text-[#868685] hover:bg-cyan-500/20 hover:text-[#9fe870] hover:border-cyan-500/30 transition-all">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteExam(exam.id); }} className="w-8 h-8 rounded-full bg-white border border-[#e8ebe6] flex items-center justify-center text-[#868685] hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Question Builder */}
            <div className="xl:col-span-3 space-y-6">
              <h3 className="text-xl font-bold text-[#0e0f0c] font-display tracking-tight px-2">Question Matrix</h3>
              
              {!selectedExam ? (
                <div className="bb-card h-[500px] flex items-center justify-center border-dashed border-[#e8ebe6] rounded-[32px]">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-white border border-[#e8ebe6] flex items-center justify-center mx-auto mb-6 shadow-inner relative group">
                      <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <Layers size={40} className="text-[#e8ebe6]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#0e0f0c] mb-2 font-display tracking-wide">Select an Exam</h3>
                    <p className="text-[#868685] font-medium tracking-wide text-sm">Choose an exam from the list to view or edit questions.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Exam Header */}
                  <div className="bb-card p-8 bb-card-accent relative overflow-hidden shadow-md">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                      <div>
                        <h3 className="text-3xl font-bold text-[#0e0f0c] font-display tracking-tight">{selectedExam.title}</h3>
                        <p className="text-[#868685] text-sm mt-3 font-medium tracking-wide flex flex-wrap gap-x-6 gap-y-2">
                          <span className="flex items-center gap-2"><BookOpen size={16}/> {selectedExam.subject || 'General'}</span>
                          <span className="flex items-center gap-2"><Clock size={16}/> {selectedExam.durationMinutes} mins</span>
                          <span className="flex items-center gap-2"><ListChecks size={16}/> {examQuestions.length} Questions</span>
                          {selectedExam.calculatedTotalMarks > 0 && <span className="flex items-center gap-2"><Zap size={16} className="text-[#9fe870]"/> {selectedExam.calculatedTotalMarks} Total Marks</span>}
                        </p>
                      </div>
                      <Button onClick={openNewQuestion} className="w-full md:w-auto px-6 py-3.5 rounded-full font-bold tracking-wide shadow-[0_0_20px_rgba(0,245,255,0.2)] flex items-center justify-center gap-2 btn-primary shrink-0">
                        <Plus size={18} /> Add Question
                      </Button>
                    </div>
                  </div>

                  {/* Questions List */}
                  {loadingQuestions ? (
                    <div className="space-y-4">
                      {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-[24px] bg-white" />)}
                    </div>
                  ) : examQuestions.length === 0 ? (
                    <div className="bb-card p-16 text-center flex flex-col items-center border-dashed border-[#e8ebe6] rounded-[32px]">
                      <div className="w-20 h-20 rounded-[20px] bg-white border border-[#e8ebe6] flex items-center justify-center mb-6 shadow-inner">
                        <ListChecks size={32} className="text-[#e8ebe6]" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0e0f0c] mb-2 font-display tracking-wide">No Questions Yet</h3>
                      <p className="text-[#868685] text-sm tracking-wide font-medium mb-8">Start building your assessment by adding the first question.</p>
                      <Button variant="outline" onClick={openNewQuestion} className="rounded-full border-[#e8ebe6] text-sm px-6">
                        <Plus size={16} className="mr-2" /> Add First Question
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {examQuestions.map((q, idx) => (
                        <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                          <div className="bb-card p-6 md:p-8 hover:-translate-y-1 transition-all duration-300 group shadow-sm">
                            <div className="flex flex-col md:flex-row gap-6">
                              <div className="w-12 h-12 rounded-[16px] bg-white border border-[#e8ebe6] flex items-center justify-center text-[#868685] text-lg font-bold shrink-0 shadow-inner group-hover:text-[#9fe870] group-hover:bg-cyan-500/10 transition-colors">
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border shadow-inner ${
                                    q.type === 'mcq' ? 'bg-cyan-500/10 text-[#9fe870] border-cyan-500/30' :
                                    q.type === 'true-false' ? 'bg-purple-500/10 text-[#9fe870] border-[#9fe870]' :
                                    'bg-amber-500/10 text-[#9fe870] border-[#9fe870]'
                                  }`}>{q.type || 'MCQ'}</span>
                                  <span className="text-[#9fe870] text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-inner">+ {q.marks || 1} Marks</span>
                                  {(q.negativeMarks || 0) > 0 && <span className="text-pink-400 text-[10px] font-bold uppercase tracking-widest bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20 shadow-inner">- {q.negativeMarks} Marks</span>}
                                </div>
                                <p className="text-[#0e0f0c] text-base md:text-lg mb-6 leading-relaxed font-medium">{q.text}</p>
                                
                                {(q.type === 'mcq' || q.type === 'true-false') && q.options && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {q.options.map((opt, oi) => (
                                      <div key={oi} className={`px-4 py-3 rounded-[16px] text-sm flex items-center gap-3 border shadow-inner ${
                                        oi === q.correctIndex
                                          ? 'bg-emerald-500/10 text-[#9fe870] border-[#163300]/30 shadow-[inset_0_0_15px_rgba(52,211,153,0.1)]'
                                          : 'bg-[#f9faf6] border-white/5 text-[#454745]'
                                      }`}>
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${oi === q.correctIndex ? 'border-emerald-500/50 bg-emerald-500/20' : 'border-[#e8ebe6] bg-white text-[#868685]'}`}>{String.fromCharCode(65+oi)}</span> 
                                        <span className="truncate font-medium">{opt}</span>
                                        {oi === q.correctIndex && <CheckCircle size={16} className="ml-auto text-[#9fe870]" />}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {q.type === 'short' && q.correctAnswer && (
                                  <div className="mt-2 inline-flex items-center gap-3 px-5 py-3 rounded-[16px] bg-emerald-500/10 text-[#9fe870] border border-[#163300]/30 shadow-[inset_0_0_15px_rgba(52,211,153,0.1)]">
                                    <span className="text-[#9fe870]/60 text-[10px] font-bold uppercase tracking-widest">Expected Match:</span> 
                                    <span className="font-bold text-sm tracking-wide">{q.correctAnswer}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex md:flex-col gap-3 shrink-0 pt-2 md:pt-0 border-t border-white/5 md:border-t-0 mt-4 md:mt-0 justify-end md:justify-start">
                                <button onClick={() => openEditQuestion(q)} className="w-10 h-10 rounded-full border border-[#e8ebe6] bg-white flex items-center justify-center text-[#868685] hover:bg-cyan-500/20 hover:text-[#9fe870] hover:border-cyan-500/30 transition-all shadow-inner" title="Edit">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDeleteQuestion(q.id)} className="w-10 h-10 rounded-full border border-[#e8ebe6] bg-white flex items-center justify-center text-[#868685] hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all shadow-inner" title="Delete">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ─── Exam Create/Edit Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {examModal && (
          <motion.div className="fixed inset-0 bg-[var(--bb-offwhite)]/80  z-50 flex items-center justify-center p-4 font-body"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bb-card w-full max-w-3xl overflow-hidden shadow-xl max-h-[90vh] flex flex-col relative rounded-[32px] border-[#9fe870]"
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
              <div className="px-8 py-6 border-b border-[#e8ebe6] flex justify-between items-center bg-white/[0.02] shrink-0 relative">
                <div className="absolute top-0 left-10 right-10 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 blur-sm rounded-full"></div>
                <h2 className="text-2xl font-bold text-[#0e0f0c] font-display tracking-tight">{editingExam ? 'Edit Exam' : 'Create New Exam'}</h2>
                <button onClick={() => setExamModal(false)} className="w-8 h-8 rounded-full bg-white border border-[#e8ebe6] flex items-center justify-center text-[#868685] hover:text-[#0e0f0c] hover:bg-white/10 transition-colors"><X size={18} /></button>
              </div>
              <div className="p-8 overflow-y-auto custom-scrollbar bg-[#f9faf6]">
                <form onSubmit={saveExam} className="space-y-6">
                  <ExamSettingsForm examForm={examForm} setExamForm={setExamForm} batches={batches} isModal={true} />
                  
                  <div className="pt-8 border-t border-[#e8ebe6] flex justify-end gap-4 mt-8">
                    <Button type="button" variant="ghost" onClick={() => setExamModal(false)} className="rounded-full px-6">Cancel</Button>
                    <Button type="submit" className="btn-primary rounded-full px-8 shadow-glow-cyan font-bold tracking-wide">{editingExam ? 'Update Exam' : 'Create Exam'}</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Question Create/Edit Modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {questionModal && (
          <motion.div className="fixed inset-0 bg-[var(--bb-offwhite)]/80  z-50 flex items-center justify-center p-4 font-body"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bb-card w-full max-w-2xl overflow-hidden shadow-xl max-h-[90vh] flex flex-col relative rounded-[32px] border-[#9fe870]"
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
              <div className="px-8 py-6 border-b border-[#e8ebe6] flex justify-between items-center bg-white/[0.02] shrink-0 relative">
                 <div className="absolute top-0 left-10 right-10 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 blur-sm rounded-full"></div>
                <h2 className="text-2xl font-bold text-[#0e0f0c] font-display tracking-tight">{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
                <button onClick={() => setQuestionModal(false)} className="w-8 h-8 rounded-full bg-white border border-[#e8ebe6] flex items-center justify-center text-[#868685] hover:text-[#0e0f0c] hover:bg-white/10 transition-colors"><X size={18} /></button>
              </div>
              <div className="p-8 overflow-y-auto bg-[#f9faf6] custom-scrollbar">
                <form onSubmit={saveQuestion} className="space-y-6">
                  {/* Type Selector */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#868685] uppercase tracking-widest ml-1">Question Type</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {[
                        { t: 'mcq', icon: Hash, label: 'Multiple Choice' },
                        { t: 'true-false', icon: ToggleLeft, label: 'True / False' },
                        { t: 'short', icon: Type, label: 'Short Answer' },
                      ].map(tp => (
                        <button key={tp.t} type="button"
                          onClick={() => {
                            setQForm(f => ({
                              ...f, type: tp.t,
                              options: tp.t === 'true-false' ? ['True', 'False'] : tp.t === 'mcq' ? (f.options.length ? f.options : ['', '', '', '']) : [],
                              correctIndex: tp.t === 'short' ? null : 0,
                            }));
                          }}
                          className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-[20px] border transition-all text-sm font-bold tracking-wide shadow-inner ${
                            qForm.type === tp.t ? 'bg-purple-500/10 border-[#9fe870] text-[#9fe870] shadow-[inset_0_0_20px_rgba(168,85,247,0.15)]' : 'bg-white border-white/5 text-[#868685] hover:bg-white/10 hover:border-[#e8ebe6]'
                          }`}>
                          <tp.icon size={24} className={qForm.type === tp.t ? 'text-[#9fe870]' : 'text-[#868685]'} /> {tp.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#868685] uppercase tracking-widest ml-1">Question Text</label>
                    <textarea rows={4} value={qForm.text} required
                      onChange={(e) => setQForm(f => ({...f, text: e.target.value}))}
                      placeholder="Write your question here..."
                      className="w-full bg-[#f9faf6] border border-[#e8ebe6] rounded-[24px] px-5 py-4 text-sm font-medium tracking-wide text-[#0e0f0c] outline-none resize-none focus:border-cyan-400 focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] transition-all shadow-inner" />
                  </div>

                  {/* MCQ Options */}
                  {qForm.type === 'mcq' && (
                    <div className="space-y-4 bg-white/[0.02] p-5 rounded-[24px] border border-white/5">
                      <label className="text-[10px] font-bold text-[#868685] uppercase tracking-widest flex justify-between ml-1">
                        <span>Answer Options</span>
                        <span className="text-[#9fe870]">Select Correct Answer</span>
                      </label>
                      <div className="space-y-3">
                        {qForm.options.map((opt, i) => (
                          <div key={i} className={`flex items-center gap-4 p-3 rounded-[16px] border transition-all shadow-inner ${qForm.correctIndex === i ? 'bg-emerald-500/10 border-[#163300]/30' : 'bg-[#f9faf6] border-white/5 hover:border-[#e8ebe6]'}`}>
                            <label className="relative flex items-center justify-center w-6 h-6 shrink-0 cursor-pointer ml-1">
                              <input type="radio" name="correctOpt" checked={qForm.correctIndex === i}
                                onChange={() => setQForm(f => ({...f, correctIndex: i}))}
                                className="peer sr-only" />
                              <div className="w-5 h-5 rounded-full border border-[#e8ebe6] peer-checked:border-emerald-400 peer-checked:bg-emerald-400 transition-all flex items-center justify-center">
                                <CheckCircle size={14} className="text-black opacity-0 peer-checked:opacity-100" strokeWidth={3} />
                              </div>
                            </label>
                            <span className={`text-sm font-bold ${qForm.correctIndex === i ? 'text-[#9fe870]' : 'text-[#868685]'}`}>{String.fromCharCode(65+i)}</span>
                            <input type="text" value={opt} required
                              onChange={(e) => {
                                const opts = [...qForm.options];
                                opts[i] = e.target.value;
                                setQForm(f => ({...f, options: opts}));
                              }}
                              placeholder={`Option ${i+1}`}
                              className="flex-1 bg-transparent border-none text-sm font-medium tracking-wide text-[#0e0f0c] outline-none placeholder:text-[#e8ebe6]" />
                            {qForm.options.length > 2 && (
                              <button type="button" onClick={() => {
                                const opts = qForm.options.filter((_, j) => j !== i);
                                setQForm(f => ({...f, options: opts, correctIndex: Math.min(f.correctIndex, opts.length - 1)}));
                              }} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#868685] hover:bg-red-500/20 hover:text-red-400 transition-colors mr-1"><X size={14} /></button>
                            )}
                          </div>
                        ))}
                      </div>
                      {qForm.options.length < 6 && (
                        <button type="button" onClick={() => setQForm(f => ({...f, options: [...f.options, '']}))}
                          className="w-full py-3 rounded-[16px] border border-dashed border-[#e8ebe6] text-[#868685] text-sm font-bold hover:bg-white hover:text-[#0e0f0c] transition-colors flex items-center justify-center gap-2 mt-2">
                          <Plus size={16}/> Add Another Option
                        </button>
                      )}
                    </div>
                  )}

                  {/* True/False */}
                  {qForm.type === 'true-false' && (
                    <div className="space-y-3 bg-white/[0.02] p-5 rounded-[24px] border border-white/5">
                      <label className="text-[10px] font-bold text-[#868685] uppercase tracking-widest ml-1">Select Correct Answer</label>
                      <div className="flex gap-4">
                        {['True', 'False'].map((val, i) => (
                          <button key={val} type="button"
                            onClick={() => setQForm(f => ({...f, correctIndex: i}))}
                            className={`flex-1 py-4 rounded-[16px] border font-bold text-sm tracking-wide transition-all shadow-inner ${
                              qForm.correctIndex === i 
                              ? 'bg-emerald-500/10 border-emerald-500/50 text-[#9fe870] shadow-[inset_0_0_20px_rgba(52,211,153,0.15)]' 
                              : 'bg-[#f9faf6] border-white/5 text-[#868685] hover:bg-white'
                            }`}>{val}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Short Answer */}
                  {qForm.type === 'short' && (
                    <div className="bg-white/[0.02] p-5 rounded-[24px] border border-white/5">
                      <InputGroup label="Expected Exact Answer" value={qForm.correctAnswer} required
                        onChange={(e) => setQForm(f => ({...f, correctAnswer: e.target.value}))}
                        placeholder="e.g. 42 or Paris" />
                      <p className="text-[#868685] text-[10px] mt-2 ml-2 leading-tight">Note: Short answers require an exact text match. They are generally case-insensitive but must match spelling exactly.</p>
                    </div>
                  )}

                  {/* Marks */}
                  <div className="grid grid-cols-2 gap-6 bg-[#f9faf6] border border-white/5 rounded-[24px] p-5 shadow-inner">
                    <InputGroup label="Marks (+)" type="number" min="0" step="0.5" value={qForm.marks}
                      onChange={(e) => setQForm(f => ({...f, marks: parseFloat(e.target.value)}))} />
                    <InputGroup label="Negative Marks (-)" type="number" min="0" step="0.25" value={qForm.negativeMarks}
                      onChange={(e) => setQForm(f => ({...f, negativeMarks: parseFloat(e.target.value)}))} />
                  </div>

                  <div className="pt-8 border-t border-[#e8ebe6] flex justify-end gap-4 mt-8">
                    <Button type="button" variant="ghost" onClick={() => setQuestionModal(false)} className="rounded-full px-6">Cancel</Button>
                    <Button type="submit" className="btn-primary rounded-full px-8 shadow-[0_0_20px_rgba(168,85,247,0.3)] font-bold tracking-wide">{editingQuestion ? 'Update Question' : 'Add Question'}</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ExamManagement;