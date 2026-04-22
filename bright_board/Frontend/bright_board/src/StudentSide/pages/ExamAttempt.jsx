import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Clock, HelpCircle, Check, ArrowRight, Save } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getExamStudent, submitExam } from '../../utils/services/exams';

const ExamAttempt = ({ examId }) => {
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const id = window.location.pathname.split('/').pop();
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getExamStudent(id);
        setExam(data.exam);
        setQuestions(data.questions || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const onSubmit = async () => {
    if (!exam) return;
    const payload = {
      answers: Object.entries(answers).map(([questionId, chosenIndex]) => ({ questionId, chosenIndex }))
    };
    try {
      setLoading(true);
      const { data } = await submitExam(exam.id, payload);
      setSubmitted(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (questions.length === 0) return 0;
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / questions.length) * 100);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                {exam ? exam.title : 'Exam Session'}
              </h1>
              <p className="text-white/50 flex items-center gap-2">
                <Clock size={14} /> {exam ? `${exam.durationMinutes} Minutes` : 'Loading...'}
              </p>
            </div>
            {!submitted && exam && (
              <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <div className="text-right">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Progress</p>
                  <p className="text-sm font-bold text-white">{Object.keys(answers).length} / {questions.length} Answered</p>
                </div>
                <div className="w-12 h-12 relative flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-blue-500" strokeDasharray={2 * Math.PI * 20} strokeDashoffset={2 * Math.PI * 20 * (1 - calculateProgress() / 100)} />
                  </svg>
                  <span className="absolute text-xs font-bold text-white">{calculateProgress()}%</span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {loading && !exam ? (
            <div className="space-y-4">
              <div className="h-8 bg-white/5 rounded w-1/3 animate-pulse" />
              <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
            </div>
          ) : submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto"
            >
              <Card variant="glass" className="p-8 text-center border-emerald-500/30 shadow-2xl shadow-emerald-500/10">
                <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 text-emerald-400">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Exam Submitted!</h2>
                <p className="text-white/50 mb-8">Your answers have been recorded successfully.</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Score</p>
                    <p className="text-3xl font-bold text-white">{submitted.score}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Correct Answers</p>
                    <p className="text-3xl font-bold text-white">{submitted.correct} <span className="text-lg text-white/40">/ {submitted.total}</span></p>
                  </div>
                </div>

                <Button variant="accent" fullWidth onClick={() => window.location.href = '/s/dashboard'}>
                  Return to Dashboard
                </Button>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card variant="glass" className={`p-6 transition-all duration-300 ${answers[q.id] !== undefined ? 'border-blue-500/30 bg-blue-500/5' : ''}`}>
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm ${answers[q.id] !== undefined
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-white/40'
                        }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white leading-relaxed">{q.text}</h3>
                      </div>
                    </div>

                    <div className="space-y-3 pl-12">
                      {q.options.map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 group ${answers[q.id] === optIdx
                              ? 'bg-blue-500/20 border-blue-500/50'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                            }`}
                        >
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${answers[q.id] === optIdx
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-white/30 group-hover:border-white/50'
                            }`}>
                            {answers[q.id] === optIdx && <Check size={12} className="text-white" />}
                          </div>
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            className="hidden"
                            onChange={() => handleAnswer(q.id, optIdx)}
                            checked={answers[q.id] === optIdx}
                          />
                          <span className={`text-sm ${answers[q.id] === optIdx ? 'text-white font-medium' : 'text-white/70'}`}>
                            {opt}
                          </span>
                        </label>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))}

              <div className="sticky bottom-6 z-20 flex justify-end">
                <Button
                  variant="accent"
                  size="lg"
                  onClick={onSubmit}
                  disabled={loading}
                  className="shadow-xl shadow-blue-500/20"
                >
                  {loading ? 'Submitting...' : (
                    <span className="flex items-center gap-2">
                      Submit Exam <Save size={18} />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamAttempt;