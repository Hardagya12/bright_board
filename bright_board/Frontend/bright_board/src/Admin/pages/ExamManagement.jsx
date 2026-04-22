import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ChevronDown, Search, Edit2, Trash2, Plus, X, Calendar, BookOpen, Clock, CheckCircle, AlertCircle, Play, Square, Layers, GripVertical, Eye, Zap, PauseCircle, ListChecks, ToggleLeft, Type, Hash } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { listExamsTutor, createExam, updateExam, updateExamStatus, deleteExam, getExamTutor, addQuestion, updateQuestion, deleteQuestion } from '../../utils/services/exams';
import { listBatches } from '../../utils/services/batches';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

const statusStyles = {
  draft: { bg: 'bg-white/10', text: 'text-white/60', label: 'Draft' },
  scheduled: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Scheduled' },
  live: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: '● Live' },
  ended: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Ended' },
};

const ExamManagement = () => {
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
    setEditingExam(null);
    setExamForm({
      title: '', description: '', subject: '', scheduledDate: format(new Date(), 'yyyy-MM-dd'),
      durationMinutes: 60, batchId: batches[0]?.id || '', status: 'draft', totalMarks: 0,
      passingMarks: 40, shuffleQuestions: false, showResultImmediately: true, instructions: '',
      negativeMarkingEnabled: false, defaultNegativeMarks: 0,
    });
    setExamModal(true);
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
    if (!confirm('Delete this exam and all its questions?')) return;
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

  const InputGroup = ({ label, ...props }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-white/60 uppercase tracking-wider">{label}</label>
      <input className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" {...props} />
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Exam Management</h1>
              <p className="text-white/50">Create exams, add questions, and manage exam lifecycle.</p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle size={16} /> {error}
              <button className="ml-auto text-red-400/60 hover:text-red-400" onClick={() => setError('')}>✕</button>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input type="text" placeholder="Search exams..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none" />
            </div>
            <div className="relative">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-black/40 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white outline-none">
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="ended">Ended</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" size={16} />
            </div>
            <Button variant="accent" onClick={openNewExam}>
              <Plus size={18} className="mr-2" /> Create Exam
            </Button>
          </div>

          {/* Two-Column Layout: Exam List + Question Builder */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Exam List */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-sm text-white/50 font-medium uppercase tracking-wider px-1">Exams ({filtered.length})</h3>
              {filtered.length === 0 && !loading ? (
                <Card variant="glass" className="p-8 text-center text-white/40">No exams found.</Card>
              ) : (
                filtered.map(exam => {
                  const st = statusStyles[exam.status || 'draft'] || statusStyles.draft;
                  const isSelected = selectedExam?.id === exam.id;
                  return (
                    <motion.div key={exam.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card variant="glass"
                        className={`p-4 cursor-pointer hover:bg-white/5 transition-all ${isSelected ? 'ring-2 ring-cyan-500/50 bg-white/5' : ''}`}
                        onClick={() => loadQuestions(exam.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-bold text-sm">{exam.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}>{st.label}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/40 mb-3">
                          <span>{exam.subject || 'General'}</span>
                          <span>•</span>
                          <span>{exam.durationMinutes}min</span>
                          <span>•</span>
                          <span>{exam.questionCount || 0} Q</span>
                        </div>
                        <div className="flex gap-1.5">
                          {/* Status action buttons */}
                          {(exam.status === 'draft' || !exam.status) && (
                            <button onClick={(e) => { e.stopPropagation(); handleStatusChange(exam.id, 'live'); }}
                              className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-lg hover:bg-emerald-500/20 transition-colors flex items-center gap-1">
                              <Play size={10} /> Go Live
                            </button>
                          )}
                          {exam.status === 'scheduled' && (
                            <button onClick={(e) => { e.stopPropagation(); handleStatusChange(exam.id, 'live'); }}
                              className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-lg hover:bg-emerald-500/20 transition-colors flex items-center gap-1">
                              <Play size={10} /> Start Now
                            </button>
                          )}
                          {exam.status === 'live' && (
                            <button onClick={(e) => { e.stopPropagation(); handleStatusChange(exam.id, 'ended'); }}
                              className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1">
                              <Square size={10} /> End Exam
                            </button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); openEditExam(exam); }}
                            className="px-2 py-1 bg-white/5 text-white/60 text-[10px] rounded-lg hover:bg-white/10 transition-colors">
                            <Edit2 size={10} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteExam(exam.id); }}
                            className="px-2 py-1 bg-white/5 text-white/60 text-[10px] rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors">
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Question Builder */}
            <div className="lg:col-span-3">
              {!selectedExam ? (
                <Card variant="glass" className="p-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Layers size={32} className="text-white/20" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Select an Exam</h3>
                  <p className="text-white/40">Click on an exam from the list to view and manage its questions.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Exam Header */}
                  <Card variant="glass" className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">{selectedExam.title}</h3>
                        <p className="text-white/40 text-xs mt-1">
                          {selectedExam.subject} • {selectedExam.durationMinutes}min • {examQuestions.length} questions
                          {selectedExam.calculatedTotalMarks > 0 && ` • ${selectedExam.calculatedTotalMarks} marks`}
                        </p>
                      </div>
                      <Button variant="accent" size="sm" onClick={openNewQuestion}>
                        <Plus size={14} className="mr-1" /> Add Question
                      </Button>
                    </div>
                  </Card>

                  {/* Questions List */}
                  {loadingQuestions ? (
                    <Card variant="glass" className="p-8 text-center text-white/40">Loading questions...</Card>
                  ) : examQuestions.length === 0 ? (
                    <Card variant="glass" className="p-12 text-center">
                      <ListChecks size={32} className="text-white/20 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-white mb-2">No Questions Yet</h3>
                      <p className="text-white/40 text-sm mb-4">Add questions to this exam.</p>
                      <Button variant="accent" onClick={openNewQuestion}>
                        <Plus size={16} className="mr-2" /> Add First Question
                      </Button>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {examQuestions.map((q, idx) => (
                        <motion.div key={q.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
                          <Card variant="glass" className="p-4 hover:bg-white/5 transition-colors group">
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/50 text-sm font-bold shrink-0">
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    q.type === 'mcq' ? 'bg-blue-500/10 text-blue-400' :
                                    q.type === 'true-false' ? 'bg-purple-500/10 text-purple-400' :
                                    'bg-amber-500/10 text-amber-400'
                                  }`}>{q.type || 'MCQ'}</span>
                                  <span className="text-emerald-400 text-[10px] font-bold">+{q.marks || 1}</span>
                                  {(q.negativeMarks || 0) > 0 && <span className="text-red-400 text-[10px] font-bold">-{q.negativeMarks}</span>}
                                </div>
                                <p className="text-white text-sm mb-2 line-clamp-2">{q.text}</p>
                                {(q.type === 'mcq' || q.type === 'true-false') && q.options && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {q.options.map((opt, oi) => (
                                      <span key={oi} className={`px-2 py-0.5 rounded text-[11px] ${
                                        oi === q.correctIndex
                                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                          : 'bg-white/5 text-white/50'
                                      }`}>
                                        {String.fromCharCode(65+oi)}. {opt}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {q.type === 'short' && q.correctAnswer && (
                                  <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    Answer: {q.correctAnswer}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button onClick={() => openEditQuestion(q)} className="p-1.5 hover:bg-white/10 rounded text-white/50 hover:text-blue-400 transition-colors"><Edit2 size={14} /></button>
                                <button onClick={() => handleDeleteQuestion(q.id)} className="p-1.5 hover:bg-white/10 rounded text-white/50 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                              </div>
                            </div>
                          </Card>
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
          <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
                <h2 className="text-xl font-bold text-white">{editingExam ? 'Edit Exam' : 'Create New Exam'}</h2>
                <button onClick={() => setExamModal(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto">
                <form onSubmit={saveExam} className="space-y-4">
                  <InputGroup label="Exam Title" value={examForm.title} onChange={(e) => setExamForm(f => ({...f, title: e.target.value}))} required />
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Subject" value={examForm.subject} onChange={(e) => setExamForm(f => ({...f, subject: e.target.value}))} />
                    <InputGroup label="Scheduled Date" type="date" value={examForm.scheduledDate} onChange={(e) => setExamForm(f => ({...f, scheduledDate: e.target.value}))} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <InputGroup label="Duration (mins)" type="number" min="1" max="600" value={examForm.durationMinutes} onChange={(e) => setExamForm(f => ({...f, durationMinutes: parseInt(e.target.value)}))} required />
                    <InputGroup label="Passing %" type="number" min="0" max="100" value={examForm.passingMarks} onChange={(e) => setExamForm(f => ({...f, passingMarks: parseInt(e.target.value)}))} />
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Batch</label>
                      <select value={examForm.batchId} onChange={(e) => setExamForm(f => ({...f, batchId: e.target.value}))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none appearance-none">
                        <option value="">None</option>
                        {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Instructions</label>
                    <textarea rows={3} value={examForm.instructions}
                      onChange={(e) => setExamForm(f => ({...f, instructions: e.target.value}))}
                      placeholder="Special instructions for students..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer">
                      <input type="checkbox" checked={examForm.shuffleQuestions}
                        onChange={(e) => setExamForm(f => ({...f, shuffleQuestions: e.target.checked}))}
                        className="accent-cyan-500 w-4 h-4" />
                      <div>
                        <p className="text-white text-sm font-medium">Shuffle Questions</p>
                        <p className="text-white/40 text-[10px]">Randomize order per student</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer">
                      <input type="checkbox" checked={examForm.showResultImmediately}
                        onChange={(e) => setExamForm(f => ({...f, showResultImmediately: e.target.checked}))}
                        className="accent-cyan-500 w-4 h-4" />
                      <div>
                        <p className="text-white text-sm font-medium">Show Result</p>
                        <p className="text-white/40 text-[10px]">Immediate after submission</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer">
                      <input type="checkbox" checked={examForm.negativeMarkingEnabled}
                        onChange={(e) => setExamForm(f => ({...f, negativeMarkingEnabled: e.target.checked}))}
                        className="accent-cyan-500 w-4 h-4" />
                      <div>
                        <p className="text-white text-sm font-medium">Negative Marking</p>
                        <p className="text-white/40 text-[10px]">Deduct marks for wrong answers</p>
                      </div>
                    </label>
                  </div>
                  <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => setExamModal(false)}>Cancel</Button>
                    <Button type="submit" variant="accent">{editingExam ? 'Update Exam' : 'Create Exam'}</Button>
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
          <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
                <h2 className="text-xl font-bold text-white">{editingQuestion ? 'Edit Question' : 'Add Question'}</h2>
                <button onClick={() => setQuestionModal(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto">
                <form onSubmit={saveQuestion} className="space-y-4">
                  {/* Type Selector */}
                  <div className="flex gap-2">
                    {[
                      { t: 'mcq', icon: Hash, label: 'MCQ' },
                      { t: 'true-false', icon: ToggleLeft, label: 'True/False' },
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
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          qForm.type === tp.t ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                        }`}>
                        <tp.icon size={16} /> {tp.label}
                      </button>
                    ))}
                  </div>

                  {/* Question Text */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Question</label>
                    <textarea rows={3} value={qForm.text} required
                      onChange={(e) => setQForm(f => ({...f, text: e.target.value}))}
                      placeholder="Enter your question..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none resize-none focus:ring-2 focus:ring-cyan-500/50" />
                  </div>

                  {/* MCQ Options */}
                  {qForm.type === 'mcq' && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Options (click radio for correct)</label>
                      {qForm.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <input type="radio" name="correctOpt" checked={qForm.correctIndex === i}
                            onChange={() => setQForm(f => ({...f, correctIndex: i}))}
                            className="accent-emerald-500 w-4 h-4" />
                          <input type="text" value={opt} required
                            onChange={(e) => {
                              const opts = [...qForm.options];
                              opts[i] = e.target.value;
                              setQForm(f => ({...f, options: opts}));
                            }}
                            placeholder={`Option ${String.fromCharCode(65+i)}`}
                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                          {qForm.options.length > 2 && (
                            <button type="button" onClick={() => {
                              const opts = qForm.options.filter((_, j) => j !== i);
                              setQForm(f => ({...f, options: opts, correctIndex: Math.min(f.correctIndex, opts.length - 1)}));
                            }} className="text-white/30 hover:text-red-400"><X size={14} /></button>
                          )}
                        </div>
                      ))}
                      {qForm.options.length < 6 && (
                        <button type="button" onClick={() => setQForm(f => ({...f, options: [...f.options, '']}))}
                          className="text-cyan-400 text-xs hover:underline">+ Add Option</button>
                      )}
                    </div>
                  )}

                  {/* True/False */}
                  {qForm.type === 'true-false' && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Correct Answer</label>
                      <div className="flex gap-3">
                        {['True', 'False'].map((val, i) => (
                          <button key={val} type="button"
                            onClick={() => setQForm(f => ({...f, correctIndex: i}))}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                              qForm.correctIndex === i ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-white/50'
                            }`}>{val}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Short Answer */}
                  {qForm.type === 'short' && (
                    <InputGroup label="Correct Answer" value={qForm.correctAnswer} required
                      onChange={(e) => setQForm(f => ({...f, correctAnswer: e.target.value}))}
                      placeholder="Expected answer..." />
                  )}

                  {/* Marks */}
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Marks" type="number" min="0" step="0.5" value={qForm.marks}
                      onChange={(e) => setQForm(f => ({...f, marks: parseFloat(e.target.value)}))} />
                    <InputGroup label="Negative Marks" type="number" min="0" step="0.25" value={qForm.negativeMarks}
                      onChange={(e) => setQForm(f => ({...f, negativeMarks: parseFloat(e.target.value)}))} />
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => setQuestionModal(false)}>Cancel</Button>
                    <Button type="submit" variant="accent">{editingQuestion ? 'Update' : 'Add Question'}</Button>
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