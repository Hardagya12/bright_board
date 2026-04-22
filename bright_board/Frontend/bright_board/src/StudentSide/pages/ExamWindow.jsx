import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, Shield, ChevronLeft, ChevronRight, Flag, X as XIcon, CheckCircle2, Send, Maximize, BookOpen } from 'lucide-react';
import { startExam, submitExam, getExamStudent } from '../../utils/services/exams';

// ─── Sub-components ──────────────────────────────────────────────────────────

const TimerBar = ({ secondsLeft, totalSeconds }) => {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const pct = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
  const isWarning = secondsLeft <= 600 && secondsLeft > 300;
  const isDanger = secondsLeft <= 300;
  const color = isDanger ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-cyan-400';
  const bgColor = isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-cyan-500';

  return (
    <div className="flex items-center gap-3">
      <Clock size={18} className={`${color} ${isDanger ? 'animate-pulse' : ''}`} />
      <span className={`font-mono text-lg font-bold ${color} tabular-nums`}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden hidden md:block">
        <div className={`h-full ${bgColor} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const QuestionNavigator = ({ questions, answers, markedForReview, currentIndex, onSelect }) => {
  const getState = (idx) => {
    const qId = questions[idx]?.id;
    if (idx === currentIndex) return 'current';
    if (markedForReview.has(qId)) return 'review';
    if (answers[qId] !== undefined) return 'answered';
    return 'not-visited';
  };

  const stateColors = {
    'current': 'bg-cyan-500 text-white ring-2 ring-cyan-400/50',
    'answered': 'bg-emerald-500 text-white',
    'review': 'bg-amber-500 text-white',
    'not-visited': 'bg-white/10 text-white/50 hover:bg-white/20',
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">Questions</h3>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${stateColors[getState(idx)]}`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
      <div className="space-y-1.5 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <div className="w-3 h-3 rounded bg-white/10" /> Not Visited
        </div>
        <div className="flex items-center gap-2 text-xs text-white/50">
          <div className="w-3 h-3 rounded bg-emerald-500" /> Answered
        </div>
        <div className="flex items-center gap-2 text-xs text-white/50">
          <div className="w-3 h-3 rounded bg-amber-500" /> Marked
        </div>
      </div>
    </div>
  );
};

const ViolationWarning = ({ count, maxViolations, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
  >
    <motion.div
      initial={{ scale: 0.8, y: 30 }}
      animate={{ scale: 1, y: 0 }}
      className="bg-[#1a1a1a] border border-amber-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl shadow-amber-500/10"
    >
      <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
        <AlertTriangle size={40} className="text-amber-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Warning! Tab Switch Detected</h2>
      <p className="text-white/60 mb-6">You have switched tabs or minimized the window.</p>
      <div className="flex justify-center gap-2 mb-6">
        {Array.from({ length: maxViolations }).map((_, i) => (
          <div key={i} className={`w-4 h-4 rounded-full ${i < count ? 'bg-amber-500' : 'bg-white/20'}`} />
        ))}
      </div>
      <p className="text-red-400 font-semibold mb-8">
        ⚠️ {maxViolations - count} more violation{maxViolations - count !== 1 ? 's' : ''} will auto-submit your exam!
      </p>
      <button
        onClick={onDismiss}
        className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors"
      >
        Return to Exam
      </button>
    </motion.div>
  </motion.div>
);

// ─── Main ExamWindow Component ───────────────────────────────────────────────

const ExamWindow = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();

  // State
  const [phase, setPhase] = useState('loading'); // loading | instructions | exam | submitted
  const [examInfo, setExamInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const MAX_VIOLATIONS = 3;
  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const startTimeRef = useRef(null);

  // ─── Load exam info (instructions screen) ────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getExamStudent(examId);
        if (data.exam.attempted) {
          setError('You have already attempted this exam.');
          setPhase('submitted');
          return;
        }
        setExamInfo(data.exam);
        setPhase('instructions');
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        setPhase('instructions');
      }
    };
    load();
  }, [examId]);

  // ─── Start exam handler ───────────────────────────────────────────────────
  const handleStartExam = async () => {
    try {
      const { data } = await startExam(examId);
      setExamInfo(data.exam);
      setQuestions(data.questions);
      const duration = data.exam.durationMinutes * 60;
      setSecondsLeft(duration);
      setTotalSeconds(duration);
      startTimeRef.current = Date.now();
      setPhase('exam');

      // Request fullscreen
      try {
        await document.documentElement.requestFullscreen?.();
      } catch { }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // ─── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'exam') return;
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          handleAutoSubmit('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // ─── Auto-save to localStorage every 30s ──────────────────────────────────
  useEffect(() => {
    if (phase !== 'exam') return;
    autoSaveRef.current = setInterval(() => {
      localStorage.setItem(`exam_${examId}_answers`, JSON.stringify(answers));
      localStorage.setItem(`exam_${examId}_currentQ`, String(currentIndex));
    }, 30000);
    return () => clearInterval(autoSaveRef.current);
  }, [phase, answers, currentIndex, examId]);

  // Restore from localStorage on start
  useEffect(() => {
    if (phase === 'exam' && questions.length > 0) {
      const saved = localStorage.getItem(`exam_${examId}_answers`);
      const savedQ = localStorage.getItem(`exam_${examId}_currentQ`);
      if (saved) {
        try { setAnswers(JSON.parse(saved)); } catch { }
      }
      if (savedQ) {
        const idx = parseInt(savedQ, 10);
        if (!isNaN(idx) && idx >= 0 && idx < questions.length) setCurrentIndex(idx);
      }
    }
  }, [phase, questions.length]);

  // ─── Proctoring: keyboard blocking + tab detection ────────────────────────
  useEffect(() => {
    if (phase !== 'exam') return;

    const blockKeys = (e) => {
      const blocked = [
        e.key === 'Tab',
        e.altKey && e.key !== 'Alt',
        e.key === 'Meta' || e.metaKey,
        e.key === 'F11',
        e.key === 'Escape',
        e.key === 'F12',
        e.ctrlKey && ['w', 't', 'n', 'r', 'a'].includes(e.key.toLowerCase()),
        e.ctrlKey && e.shiftKey,
      ];
      if (blocked.some(Boolean)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) recordViolation('tab_switch');
    };

    const handleBlur = () => {
      // Small delay to avoid false positives from fullscreen changes
      setTimeout(() => {
        if (phase === 'exam' && !isSubmittingRef.current) {
          recordViolation('window_blur');
        }
      }, 200);
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && phase === 'exam' && !isSubmittingRef.current) {
        setTimeout(() => {
          if (!isSubmittingRef.current) {
            try { document.documentElement.requestFullscreen?.(); } catch { }
          }
        }, 1500);
      }
    };

    const blockContextMenu = (e) => e.preventDefault();

    document.addEventListener('keydown', blockKeys, true);
    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', blockContextMenu);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('keydown', blockKeys, true);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', blockContextMenu);
      window.removeEventListener('blur', handleBlur);
    };
  }, [phase]);

  // ─── Violation handler ────────────────────────────────────────────────────
  const recordViolation = useCallback((type) => {
    if (isSubmittingRef.current) return;
    setViolations(prev => {
      const newCount = prev + 1;
      if (newCount >= MAX_VIOLATIONS) {
        handleAutoSubmit('violation');
      } else {
        setShowWarning(true);
      }
      return newCount;
    });
  }, []);

  // ─── Submit helpers ───────────────────────────────────────────────────────
  const buildPayload = useCallback((type) => {
    const timeTaken = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
    return {
      answers: questions.map(q => ({
        questionId: q.id,
        chosenIndex: answers[q.id]?.chosenIndex ?? null,
        textAnswer: answers[q.id]?.textAnswer || '',
      })),
      tabSwitchCount: violations,
      submissionType: type,
      timeTaken,
    };
  }, [questions, answers, violations]);

  const handleAutoSubmit = useCallback(async (type) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setSubmitting(true);
    clearInterval(timerRef.current);
    clearInterval(autoSaveRef.current);

    try {
      const { data } = await submitExam(examId, buildPayload(type));
      setSubmitResult({ ...data, submissionType: type });
      setPhase('submitted');
      localStorage.removeItem(`exam_${examId}_answers`);
      localStorage.removeItem(`exam_${examId}_currentQ`);
      try { document.exitFullscreen?.(); } catch { }
    } catch (err) {
      setError(err.response?.data?.error || 'Submit failed');
      setPhase('submitted');
    }
    setSubmitting(false);
  }, [examId, buildPayload]);

  const handleManualSubmit = async () => {
    setShowConfirmSubmit(false);
    await handleAutoSubmit('manual');
  };

  // ─── Answer handlers ─────────────────────────────────────────────────────
  const selectOption = (questionId, chosenIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: { chosenIndex, textAnswer: '' } }));
  };

  const setTextAnswer = (questionId, text) => {
    setAnswers(prev => ({ ...prev, [questionId]: { chosenIndex: null, textAnswer: text } }));
  };

  const clearResponse = (questionId) => {
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  const toggleReview = (questionId) => {
    setMarkedForReview(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  // ─── Stats ────────────────────────────────────────────────────────────────
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const reviewCount = markedForReview.size;
  const currentQ = questions[currentIndex];

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════

  // ─── LOADING ──────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading exam...</p>
        </div>
      </div>
    );
  }

  // ─── INSTRUCTIONS ─────────────────────────────────────────────────────────
  if (phase === 'instructions') {
    return (
      <div className="fixed inset-0 bg-black overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 p-8 border-b border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                    <BookOpen size={28} className="text-cyan-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">{examInfo?.title || 'Exam'}</h1>
                    <p className="text-white/50">{examInfo?.subject || ''}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Duration', value: `${examInfo?.durationMinutes || 0} min` },
                    { label: 'Questions', value: examInfo?.questionCount || '—' },
                    { label: 'Total Marks', value: examInfo?.calculatedTotalMarks || examInfo?.totalMarks || '—' },
                    { label: 'Passing', value: examInfo?.passingMarks ? `${examInfo.passingMarks}%` : '40%' },
                  ].map((item, i) => (
                    <div key={i} className="bg-black/30 rounded-xl p-3 text-center">
                      <p className="text-white/40 text-xs uppercase tracking-wider">{item.label}</p>
                      <p className="text-white font-bold text-lg">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="p-8 space-y-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield size={20} className="text-amber-400" /> Exam Rules & Instructions
                </h2>

                {examInfo?.instructions && (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-white/70 text-sm whitespace-pre-wrap">
                    {examInfo.instructions}
                  </div>
                )}

                <ul className="space-y-3">
                  {[
                    'This exam will open in fullscreen mode.',
                    'You cannot switch tabs or windows during the exam.',
                    'Tab switching is allowed max 2 times. On 3rd violation, exam auto-submits.',
                    'Do not press Escape, Alt+Tab, Windows key, or Ctrl+W.',
                    'Your answers are auto-saved every 30 seconds.',
                    'Ensure stable internet before starting.',
                    'Do not refresh the page during exam.',
                    examInfo?.negativeMarkingEnabled ? '⚠️ Negative marking is enabled for wrong answers.' : null,
                  ].filter(Boolean).map((rule, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/50 shrink-0">{i + 1}</span>
                      {rule}
                    </li>
                  ))}
                </ul>

                {/* System Check */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Fullscreen', status: !!document.documentElement.requestFullscreen },
                    { label: 'Browser', status: true },
                    { label: 'Internet', status: navigator.onLine },
                  ].map((check, i) => (
                    <div key={i} className={`flex items-center gap-2 p-3 rounded-xl border text-sm ${check.status ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                      <CheckCircle2 size={16} /> {check.label}: {check.status ? 'Ready' : 'Issue'}
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
                )}

                <button
                  onClick={handleStartExam}
                  disabled={!!error || examInfo?.attempted}
                  className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-3"
                >
                  <Maximize size={20} /> Start Exam
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── SUBMITTED ────────────────────────────────────────────────────────────
  if (phase === 'submitted') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
            {error && !submitResult ? (
              <>
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle size={40} className="text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Submission Error</h2>
                <p className="text-white/60 mb-8">{error}</p>
              </>
            ) : submitResult?.showResult === false ? (
              <>
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Exam Submitted!</h2>
                <p className="text-white/60 mb-4">Your answers have been recorded successfully.</p>
                <p className="text-white/40 text-sm mb-8">Your tutor will review and publish results soon.</p>
              </>
            ) : submitResult ? (
              <>
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Exam Completed!</h2>

                {submitResult.submissionType !== 'manual' && (
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                    submitResult.submissionType === 'violation' ? 'bg-red-500/20 text-red-400' :
                    submitResult.submissionType === 'timeout' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    Auto-submitted: {submitResult.submissionType}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 my-6">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Score</p>
                    <p className="text-3xl font-bold text-white">{submitResult.score}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Marks</p>
                    <p className="text-3xl font-bold text-white">{submitResult.totalScore}<span className="text-lg text-white/40">/{submitResult.maxMarks}</span></p>
                  </div>
                </div>

                <div className="flex justify-center gap-6 text-sm mb-6">
                  <span className="text-emerald-400">✅ {submitResult.correct} Correct</span>
                  <span className="text-red-400">❌ {submitResult.wrong} Wrong</span>
                  <span className="text-white/40">⭕ {submitResult.unattempted} Skipped</span>
                </div>

                <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${submitResult.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {submitResult.passed ? '✅ PASSED' : '❌ FAILED'}
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Exam Submitted!</h2>
                <p className="text-white/60 mb-8">Your answers have been recorded.</p>
              </>
            )}

            <button
              onClick={() => navigate('/s/dashboard')}
              className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── EXAM UI ──────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col select-none">
      {/* Violation Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <ViolationWarning
            count={violations}
            maxViolations={MAX_VIOLATIONS}
            onDismiss={() => setShowWarning(false)}
          />
        )}
      </AnimatePresence>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-4">Submit Exam?</h2>
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Attempted</span>
                  <span className="text-emerald-400 font-bold">{answeredCount}/{questions.length}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Unanswered</span>
                  <span className="text-red-400 font-bold">{unansweredCount}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Marked for Review</span>
                  <span className="text-amber-400 font-bold">{reviewCount}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl transition-colors font-bold"
                >
                  {submitting ? 'Submitting...' : 'Yes, Submit'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="h-14 bg-black/80 border-b border-white/10 flex items-center justify-between px-4 md:px-6 shrink-0 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <span className="text-white font-bold text-sm hidden md:block">{examInfo?.title}</span>
          <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/60">{examInfo?.subject}</span>
        </div>
        <div className="flex items-center gap-6">
          <TimerBar secondsLeft={secondsLeft} totalSeconds={totalSeconds} />
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
            violations === 0 ? 'bg-emerald-500/20 text-emerald-400' :
            violations === 1 ? 'bg-amber-500/20 text-amber-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            <AlertTriangle size={14} /> {violations}/{MAX_VIOLATIONS}
          </div>
          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="px-4 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Send size={14} /> Submit
          </button>
        </div>
      </div>

      {/* ─── Main Content ────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Question Navigator */}
        <div className="w-[200px] bg-black/50 border-r border-white/10 p-4 overflow-y-auto hidden md:block shrink-0">
          <QuestionNavigator
            questions={questions}
            answers={answers}
            markedForReview={markedForReview}
            currentIndex={currentIndex}
            onSelect={setCurrentIndex}
          />
          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="mt-6 w-full py-3 bg-red-600/80 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Send size={16} /> Submit Exam
          </button>
        </div>

        {/* Right: Question Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {currentQ && (
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Question Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-white/50 text-sm font-medium">
                  Question <span className="text-white font-bold text-lg">{currentIndex + 1}</span> of {questions.length}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg">
                    +{currentQ.marks} marks
                  </span>
                  {currentQ.negativeMarks > 0 && (
                    <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg">
                      -{currentQ.negativeMarks} marks
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <p className="text-white text-lg md:text-xl leading-relaxed font-medium">
                {currentQ.text}
              </p>

              {/* Question Image */}
              {currentQ.questionImage && (
                <img
                  src={currentQ.questionImage}
                  alt="Question"
                  className="max-w-full max-h-64 rounded-xl border border-white/10 object-contain"
                />
              )}

              {/* Options (MCQ & True-False) */}
              {(currentQ.type === 'mcq' || currentQ.type === 'true-false') && (
                <div className="space-y-3">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = answers[currentQ.id]?.chosenIndex === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => selectOption(currentQ.id, optIdx)}
                        className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-500/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'border-cyan-400 bg-cyan-500' : 'border-white/30'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className={`text-sm md:text-base ${isSelected ? 'text-white font-medium' : 'text-white/70'}`}>
                          {currentQ.type === 'mcq' && <span className="text-white/30 mr-2">{String.fromCharCode(65 + optIdx)}.</span>}
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Short Answer */}
              {currentQ.type === 'short' && (
                <textarea
                  value={answers[currentQ.id]?.textAnswer || ''}
                  onChange={(e) => setTextAnswer(currentQ.id, e.target.value)}
                  placeholder="Type your answer here..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:ring-2 focus:ring-cyan-500/50 outline-none resize-none"
                />
              )}

              {/* Action Row */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex gap-3">
                  <button
                    onClick={() => toggleReview(currentQ.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      markedForReview.has(currentQ.id)
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <Flag size={14} /> {markedForReview.has(currentQ.id) ? 'Marked' : 'Mark for Review'}
                  </button>
                  <button
                    onClick={() => clearResponse(currentQ.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <XIcon size={14} /> Clear
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(prev => prev - 1)}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>
                  <button
                    disabled={currentIndex === questions.length - 1}
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-500 transition-colors disabled:opacity-30"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Mobile Bottom Nav ───────────────────────────────────────────── */}
      <div className="md:hidden h-14 bg-black/80 border-t border-white/10 flex items-center justify-between px-4 shrink-0">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(prev => prev - 1)}
          className="p-2 text-white/60 disabled:opacity-30"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="text-white/60 text-sm">{currentIndex + 1} / {questions.length}</span>
        <button
          disabled={currentIndex === questions.length - 1}
          onClick={() => setCurrentIndex(prev => prev + 1)}
          className="p-2 text-white/60 disabled:opacity-30"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default ExamWindow;
