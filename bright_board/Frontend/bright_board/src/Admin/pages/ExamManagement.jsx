import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { format } from 'date-fns';
import { ChevronDown, Search, Edit2, Trash2, Plus, X } from 'lucide-react';
import './ExamManagement.css';
import AdminSidebar from '../components/AdminSidebar';

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

  useEffect(() => {
    const mockExams = [
      { id: 1, name: 'Mid-term Exam', subject: 'Mathematics', date: '2024-04-15', duration: 180, batch: 'A' },
      { id: 2, name: 'Final Exam', subject: 'Physics', date: '2024-05-20', duration: 240, batch: 'B' },
      { id: 3, name: 'Quiz 1', subject: 'Chemistry', date: '2024-03-10', duration: 60, batch: 'C' },
      { id: 4, name: 'Lab Test', subject: 'Biology', date: '2024-06-05', duration: 120, batch: 'A' },
    ];
    setExams(mockExams);
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

  const handleDeleteExam = (examId) => {
    setExams(exams.filter(exam => exam.id !== examId));
  };

  const handleSubmitExam = (e) => {
    e.preventDefault();
    if (editingExam) {
      setExams(exams.map(exam => 
        exam.id === editingExam.id ? { ...exam, ...newExam } : exam
      ));
    } else {
      setExams([...exams, { id: Date.now(), ...newExam }]);
    }
    setIsModalOpen(false);
  };

  const subjectData = mockSubjects.map(subject => ({
    name: subject,
    count: exams.filter(exam => exam.subject === subject).length
  }));

  const upcomingExams = [...exams]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="examadmin-wrapper">
      <AdminSidebar />
      <motion.div 
        className="examadmin-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header className="examadmin-header">
          <h1>Exam Management</h1>
          <div className="examadmin-batch-selector">
            <motion.button
              className="examadmin-batch-button"
              onClick={() => setShowBatchDropdown(!showBatchDropdown)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {selectedBatch} <ChevronDown size={20} />
            </motion.button>
            <AnimatePresence>
              {showBatchDropdown && (
                <motion.div
                  className="examadmin-batch-dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {mockBatches.map(batch => (
                    <motion.div
                      key={batch}
                      className="examadmin-batch-option"
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

        <div className="examadmin-controls">
          <div className="examadmin-search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <motion.button
            className="examadmin-add-button"
            onClick={handleAddExam}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} /> Add New Exam
          </motion.button>
        </div>

        <div className="examadmin-table-container">
          <table className="examadmin-table">
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
                    className="examadmin-table-row"
                  >
                    <td>{exam.name}</td>
                    <td>{exam.subject}</td>
                    <td>{format(new Date(exam.date), 'MMM dd, yyyy')}</td>
                    <td>{`${Math.floor(exam.duration / 60)}h ${exam.duration % 60}m`}</td>
                    <td>{exam.batch}</td>
                    <td className="examadmin-actions">
                      <motion.button
                        className="examadmin-action-button examadmin-edit"
                        onClick={() => handleEditExam(exam)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit2 size={18} />
                      </motion.button>
                      <motion.button
                        className="examadmin-action-button examadmin-delete"
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

        <div className="examadmin-analytics">
          <h2>Exam Analytics</h2>
          <div className="examadmin-charts">
            <div className="examadmin-chart">
              <h3>Exams by Subject</h3>
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

            <div className="examadmin-chart">
              <h3>Upcoming Exams</h3>
              <div className="examadmin-upcoming-list">
                {upcomingExams.map(exam => (
                  <motion.div 
                    key={exam.id}
                    className="examadmin-upcoming-item"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="examadmin-upcoming-info">
                      <h4>{exam.name}</h4>
                      <p>{exam.subject}</p>
                    </div>
                    <div className="examadmin-upcoming-date">
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
              className="examadmin-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="examadmin-modal"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <button 
                  className="examadmin-close-button"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X size={24} />
                </button>
                <h2>{editingExam ? 'Edit Exam' : 'Add New Exam'}</h2>
                <form onSubmit={handleSubmitExam} className="examadmin-form">
                  <div className="examadmin-form-group">
                    <label>Exam Name</label>
                    <input
                      type="text"
                      value={newExam.name}
                      onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="examadmin-form-group">
                    <label>Subject</label>
                    <select
                      value={newExam.subject}
                      onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
                      required
                    >
                      <option value="" className="examadmin-select-placeholder">Select Subject</option>
                      {mockSubjects.map(subject => (
                        <option key={subject} value={subject} className="examadmin-select-placeholder">{subject}</option>
                      ))}
                    </select>
                  </div>
                  <div className="examadmin-form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={newExam.date}
                      onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="examadmin-form-group">
                    <label>Duration (minutes)</label>
                    <input
                      type="number"
                      value={newExam.duration}
                      onChange={(e) => setNewExam({ ...newExam, duration: parseInt(e.target.value) })}
                      min="30"
                      max="360"
                      required
                    />
                  </div>
                  <div className="examadmin-form-group">
                    <label>Batch</label>
                    <select
                      value={newExam.batch}
                      onChange={(e) => setNewExam({ ...newExam, batch: e.target.value })}
                      required
                    >
                      <option value="">Select Batch</option>
                      {mockBatches.map(batch => (
                        <option key={batch} value={batch}>{batch}</option>
                      ))}
                    </select>
                  </div>
                  <motion.button
                    type="submit"
                    className="examadmin-submit-button"
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