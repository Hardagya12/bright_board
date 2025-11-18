import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { format } from 'date-fns';
import { ChevronDown, Search, Edit2, Trash2, Plus, X } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import Button from '../../components/ui/Button';
import { listExamsTutor, createExam, updateExam, deleteExam } from '../../utils/services/exams';

const mockBatches = ['A', 'B', 'C'];
const mockSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'];

const ExamManagement = () => {
  const [selectedBatch, setSelectedBatch] = useState(mockBatches[0]);
  const [exams, setExams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingExam, setEditingExam] = useState(null);
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);
  const [newExam, setNewExam] = useState({
    name: '',
    subject: '',
    date: '',
    duration: 60,
    batch: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await listExamsTutor();
        const mapped = (data.exams || []).map(e => ({
          id: e.id,
          name: e.title,
          subject: e.subject || '-',
          date: e.scheduledDate ? e.scheduledDate : '',
          duration: e.durationMinutes,
          batch: e.batchId || '-',
          published: e.published,
        }));
        setExams(mapped);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedBatch]);

  const filteredExams = exams.filter(exam => {
    const searchLower = searchTerm.toLowerCase();
    return (
      exam.name.toLowerCase().includes(searchLower) ||
      exam.subject.toLowerCase().includes(searchLower) ||
      exam.batch.toLowerCase().includes(searchLower)
    );
  });

  const handleAddExam = () => {
    setEditingExam(null);
    setNewExam({
      name: '',
      subject: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      duration: 60,
      batch: selectedBatch
    });
    setIsModalOpen(true);
  };

  const handleEditExam = (exam) => {
    setEditingExam(exam);
    setNewExam({
      name: exam.name,
      subject: exam.subject,
      date: exam.date,
      duration: exam.duration,
      batch: exam.batch
    });
    setIsModalOpen(true);
  };

  const handleDeleteExam = async (examId) => {
    try {
      await deleteExam(examId);
      setExams(exams.filter(exam => exam.id !== examId));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleSubmitExam = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: newExam.name,
        description: '',
        durationMinutes: newExam.duration,
        subject: newExam.subject,
        scheduledDate: newExam.date,
        batchId: newExam.batch,
        published: true,
      };
      if (editingExam) {
        await updateExam(editingExam.id, payload);
        setExams(exams.map(exam => exam.id === editingExam.id ? { ...exam, ...newExam } : exam));
      } else {
        const { data } = await createExam(payload);
        setExams([...exams, { id: data.examId, ...newExam }]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const subjectData = mockSubjects.map(subject => ({
    name: subject,
    count: exams.filter(exam => exam.subject === subject).length
  }));

  const upcomingExams = [...exams]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-black text-white flex">
      <AdminSidebar />
      <motion.div 
        className="flex-1 p-6 space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header className="flex items-center justify-between">
          <h1 className="font-comic text-2xl">Exam Management</h1>
          <div className="relative">
            <motion.button
              className="border border-bw-37 rounded px-3 py-2"
              onClick={() => setShowBatchDropdown(!showBatchDropdown)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {selectedBatch} <ChevronDown size={20} />
            </motion.button>
            <AnimatePresence>
              {showBatchDropdown && (
                <motion.div
                  className="absolute right-0 mt-2 border border-bw-37 rounded bg-black p-2 z-10"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {mockBatches.map(batch => (
                    <motion.div
                      key={batch}
                      className="px-3 py-2 rounded hover:bg-bw-12 cursor-pointer"
                      onClick={() => {
                        setSelectedBatch(batch);
                        setShowBatchDropdown(false);
                      }}
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(99, 102, 241, 0.2)' }}
                    >
                      {batch}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <div className="border border-bw-37 rounded-lg bg-black p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 border border-bw-37 rounded px-3 py-2">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black focus:outline-none"
            />
          </div>
          {loading && <div className="text-bw-62">Loading exams...</div>}
          {error && <div className="text-bw-62">{error}</div>}
          <motion.button
            className="border border-bw-37 rounded px-3 py-2"
            onClick={handleAddExam}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} /> Add New Exam
          </motion.button>
        </div>

        <div className="border border-bw-37 rounded-lg bg-black p-4">
          <table className="min-w-full text-left">
            <thead>
              <tr>
                <th>Exam Name</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Batch</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredExams.map(exam => (
                  <motion.tr
                    key={exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="hover:bg-bw-12 transition-colors"
                  >
                    <td>{exam.name}</td>
                    <td>{exam.subject}</td>
                    <td>{format(new Date(exam.date), 'MMM dd, yyyy')}</td>
                    <td>{`${Math.floor(exam.duration / 60)}h ${exam.duration % 60}m`}</td>
                    <td>{exam.batch}</td>
                    <td>
                      <motion.button
                        className="border border-bw-37 rounded p-2 mr-2"
                        onClick={() => handleEditExam(exam)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit2 size={18} />
                      </motion.button>
                      <motion.button
                        className="border border-bw-37 rounded p-2"
                        onClick={() => handleDeleteExam(exam.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <h2 className="font-comic text-lg">Exam Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-bw-37 rounded-lg bg-black p-4">
              <h3 className="font-comic mb-2">Exams by Subject</h3>
              <BarChart width={500} height={300} data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#e5e7eb" />
                <YAxis stroke="#e5e7eb" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(26, 26, 46, 0.95)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Bar dataKey="count" fill="#6366f1">
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </div>

            <div className="border border-bw-37 rounded-lg bg-black p-4">
              <h3 className="font-comic mb-2">Upcoming Exams</h3>
              <div className="space-y-2">
                {upcomingExams.map(exam => (
                  <motion.div 
                    key={exam.id}
                    className="border border-bw-37 rounded p-3 flex items-center justify-between"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div>
                      <h4>{exam.name}</h4>
                      <p>{exam.subject}</p>
                    </div>
                    <div>
                      {format(new Date(exam.date), 'MMM dd, yyyy')}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="fixed inset-0 bg-black/60 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="border border-bw-37 bg-black text-white rounded-lg p-6 w-full max-w-xl"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <button 
                  className="border border-bw-37 rounded p-2"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X size={24} />
                </button>
                <h2>{editingExam ? 'Edit Exam' : 'Add New Exam'}</h2>
                <form onSubmit={handleSubmitExam} className="space-y-3 mt-3">
                  <div>
                    <label>Exam Name</label>
                    <input
                      type="text"
                      value={newExam.name}
                      onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label>Subject</label>
                    <select
                      value={newExam.subject}
                      onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none"
                    >
                      <option value="" className="examadmin-select-placeholder">Select Subject</option>
                      {mockSubjects.map(subject => (
                        <option key={subject} value={subject} className="examadmin-select-placeholder">{subject}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Date</label>
                    <input
                      type="date"
                      value={newExam.date}
                      onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label>Duration (minutes)</label>
                    <input
                      type="number"
                      value={newExam.duration}
                      onChange={(e) => setNewExam({ ...newExam, duration: parseInt(e.target.value) })}
                      min="30"
                      max="360"
                      required
                      className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label>Batch</label>
                    <select
                      value={newExam.batch}
                      onChange={(e) => setNewExam({ ...newExam, batch: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-black border border-bw-37 rounded text-white focus:outline-none"
                    >
                      <option value="">Select Batch</option>
                      {mockBatches.map(batch => (
                        <option key={batch} value={batch}>{batch}</option>
                      ))}
                    </select>
                  </div>
                  <motion.button
                    type="submit"
                    className="border border-bw-37 rounded px-3 py-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {editingExam ? 'Update Exam' : 'Create Exam'}
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ExamManagement;