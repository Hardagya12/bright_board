import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Clock, Check, Save, Flag, X as XIcon, Zap } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Button from '../../components/ui/Button';
import { getExamStudent, submitExam } from '../../utils/services/exams';

const ExamAttempt = ({ examId }) => {
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(null);

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
    <div className="flex h-screen overflow-hidden bg-[#f9faf6] font-body relative">
      <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
            
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-[#e8ebe6] scrollbar-track-transparent relative z-10 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-10">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#0e0f0c] font-display tracking-tight mb-2">
                {exam ? exam.title : 'Assessment Session'}
              </h1>
              <p className="text-[#868685] flex items-center gap-2 font-medium tracking-wide">
                <Clock size={16} className="text-cyan-400" /> {exam ? `${exam.durationMinutes} Minutes` : 'Loading...'}
              </p>
            </div>
            {!submitted && exam && (
              <div className="flex items-center gap-5 bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm px-6 py-3 rounded-full border border-[#e8ebe6] shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                <div className="text-right">
                  <p className="text-[10px] text-[#868685] font-bold uppercase tracking-widest">Progress</p>
                  <p className="text-sm font-bold text-[#0e0f0c] tracking-wide">{Object.keys(answers).length} / {questions.length} Answered</p>
                </div>
                <div className="w-12 h-12 relative flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[#e8ebe6]" />
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-cyan-400 shadow-[0_0_10px_currentColor]" strokeDasharray={2 * Math.PI * 20} strokeDashoffset={2 * Math.PI * 20 * (1 - calculateProgress() / 100)} />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-[#0e0f0c]">{calculateProgress()}%</span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-5 rounded-[20px] bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3 shadow-[0_0_15px_rgba(248,113,113,0.15)] font-bold tracking-wide">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {loading && !exam ? (
            <div className="space-y-6">
              <div className="h-8 bg-white rounded-full w-1/3 animate-pulse" />
              <div className="h-64 bg-white rounded-[32px] animate-pulse" />
            </div>
          ) : submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto mt-10"
            >
              <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-10 md:p-12 text-center border-emerald-400/30 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] accent-top-green relative overflow-hidden">
                <div className="absolute top-0 left-10 right-10 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50 blur-sm rounded-full"></div>
                
                <div className="w-24 h-24 rounded-[24px] bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-8 text-emerald-400 shadow-[inset_0_0_20px_rgba(52,211,153,0.2)]">
                  <CheckCircle2 size={48} className="drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                </div>
                <h2 className="text-3xl font-bold text-[#0e0f0c] mb-2 font-display tracking-tight">Assessment Completed</h2>
                <p className="text-[#868685] mb-10 text-sm tracking-wide">Your responses have been recorded successfully.</p>

                <div className="grid grid-cols-2 gap-5 mb-10">
                  <div className="p-6 rounded-[24px] bg-[#f9faf6] border border-[#e8ebe6] relative overflow-hidden group hover:border-cyan-400 transition-colors">
                    <p className="text-[#868685] text-[10px] font-bold uppercase tracking-widest mb-2 relative z-10">Final Score</p>
                    <p className="text-4xl font-bold text-cyan-500 relative z-10">{submitted.score}%</p>
                  </div>
                  <div className="p-6 rounded-[24px] bg-[#f9faf6] border border-[#e8ebe6] relative overflow-hidden group hover:border-emerald-400 transition-colors">
                    <p className="text-[#868685] text-[10px] font-bold uppercase tracking-widest mb-2 relative z-10">Correct Answers</p>
                    <p className="text-4xl font-bold text-emerald-500 relative z-10">{submitted.correct} <span className="text-xl text-[#868685]">/ {submitted.total}</span></p>
                  </div>
                </div>

                <Button className="w-full py-4 rounded-full bg-white border border-[#e8ebe6] hover:bg-[#e2f6d5] text-[#0e0f0c] font-bold tracking-wide transition-all shadow-inner" onClick={() => window.location.href = '/s/dashboard'}>
                  Return to Dashboard
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {questions.map((q, idx) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className={`bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-8 md:p-10 transition-all duration-300 relative overflow-hidden ${answers[q.id] !== undefined ? 'border-cyan-200 bg-cyan-50/50' : ''}`}>
                    {answers[q.id] !== undefined && (
                      <div className="absolute top-0 left-10 right-10 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30 rounded-full"></div>
                    )}
                    <div className="flex items-start gap-6 mb-8">
                      <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 font-bold text-lg border ${answers[q.id] !== undefined
                          ? 'bg-cyan-100 text-cyan-600 border-cyan-300'
                          : 'bg-white text-[#868685] border-[#e8ebe6]'
                        }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 pt-1.5">
                        <h3 className="text-xl font-medium text-[#0e0f0c] leading-relaxed tracking-wide">{q.text}</h3>
                      </div>
                    </div>

                    <div className="space-y-4 pl-0 md:pl-16">
                      {q.options.map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          className={`flex items-center gap-5 p-5 rounded-[20px] border cursor-pointer transition-all duration-300 group ${answers[q.id] === optIdx
                              ? 'bg-cyan-50 border-cyan-400 shadow-sm'
                              : 'bg-[#f9faf6] border-[#e8ebe6] hover:bg-white hover:border-cyan-200'
                            }`}
                        >
                          <div className={`w-6 h-6 rounded-full border-[2px] flex items-center justify-center transition-colors ${answers[q.id] === optIdx
                              ? 'border-cyan-500'
                              : 'border-[#e8ebe6] group-hover:border-cyan-300'
                            }`}>
                            {answers[q.id] === optIdx && <div className="w-3 h-3 rounded-full bg-cyan-500" />}
                          </div>
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            className="hidden"
                            onChange={() => handleAnswer(q.id, optIdx)}
                            checked={answers[q.id] === optIdx}
                          />
                          <span className={`text-base tracking-wide ${answers[q.id] === optIdx ? 'text-[#0e0f0c] font-bold' : 'text-[#0e0f0c]/70 font-medium group-hover:text-[#0e0f0c]/90'}`}>
                            {opt}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="sticky bottom-8 z-20 flex justify-end">
                <Button
                  onClick={onSubmit}
                  disabled={loading}
                  className="py-4 px-8 btn-primary rounded-full shadow-md hover:shadow-lg font-bold tracking-wide disabled:opacity-50 text-lg flex items-center gap-3"
                >
                  {loading ? 'Submitting...' : (
                    <>
                      <Zap size={20} /> Submit Assessment
                    </>
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